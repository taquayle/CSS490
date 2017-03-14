//document.getElementById("D1").innerHTML = "( "+ var + " " + var + " )";

/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable,
  GameObject, PrintLine, PrintHandler */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kWall = "assets/wall.png";
    this.kPlat = "assets/platform.png";
    this.kPlatInv = "assets/platform_inv.png";
    this.kTarg = "assets/target.png";
    /**************************************************************************/
    // CAMERA SETTINGS
    this.kWinSizeWidth = .99;        // % Amount of screen width to take up
    this.kWinSizeHeight = .95;       // % Amount of screen height to take up
    this.kWorldScale = 10;           // 1/this scale. Higher number WC = less
    // The camera to view the scene
    this.mCamera = null;
    this.mImpulse = true;
    this.mMovement = true;
    this.mMsg = null;

    this.mObjs = null;
    this.mBorder = null;
    this.mBalance = null;
    this.mTarget = null;
    
    this.circAndRec = 0; // 0 = both, 1 = only circles, 2 = only rectangles
    this.mDefaultObj = 10;
    this.mNumOfObj = 10;
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kWall);
    gEngine.Textures.loadTexture(this.kPlat);
    gEngine.Textures.loadTexture(this.kPlatInv);
    gEngine.Textures.loadTexture(this.kTarg);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kWall);
    gEngine.Textures.unloadTexture(this.kPlat);
    gEngine.Textures.unloadTexture(this.kPlatInv);
    gEngine.Textures.unloadTexture(this.kTarg);
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.setCanvasSize(this.kWinSizeWidth ,this.kWinSizeHeight);
    var can =  document.getElementById("GLCanvas");
    if(this.kWorldScale > 10)
        this.kWorldScale = 10;
    if(this.kWorldScale <= 2)
        this.kWorldScale = 2;
    var scale = can.width * (1/this.kWorldScale);
    this.mCamera = new Camera(
        vec2.fromValues(50, 40), // position of the camera
        scale,                     // width of camera
        [0, 0, can.width, can.height]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    var msg = "hello world \nhello computer";
    this.mMsg = new PrintHandler(this.mCamera, msg);
    this.mBorder = new GameObjectSet();
    this.buildBorder();
    this.mBorder.addToSet(new Platform(this.kPlat, 30, 40, -30));
    this.mBorder.addToSet(new Platform(this.kPlat, 60, 30, 0));
    this.mBorder.addToSet(new Platform(this.kPlat, 20, 20, 0));
    this.mBorder.addToSet(new Platform(this.kPlat, 70, 50,0));
    this.mObjs = new GameObjectSet();
    for(var i = 0; i < this.mNumOfObj; i++)
        this.addObject();
    this.mObjs.toggleControl(0);
    this.mTarget = new Target(this.kTarg, 0, 0);
    
    this.mBalance = new GameObjectSet();
    this.mBalance.addToSet(new Platform(this.kPlatInv, 20, 65, 0));
    this.mBalance.addToSet(new Platform(this.kPlatInv, 90, 20, 0));
};

MyGame.prototype.addObjectByKey= function(type)
{
    this.mNumOfObj += 1;
    var pY = this.mCamera.getWCCenter()[1] + (this.mCamera.getWCHeight()/2) -10;
    var pX = ((this.mCamera.getWCWidth()-20)/2) + 20;
    if(type==="Rectangle")
        this.mObjs.addToSet(new Rect(this.kMinionSprite, Math.random()*pX, pY));
    else if(type==="Circle")
        this.mObjs.addToSet(new Circ(this.kMinionSprite, Math.random()*pX, pY));
    else
        this.mNumOfObj -= 1;
};

MyGame.prototype.addObject = function()
{
    switch(this.circAndRec)
    {
        case 0:
            if(Math.random() >= .5)
                this.addObjectByKey("Circle");
            else
                this.addObjectByKey("Rectangle");
            break;
        case 1:
            this.addObjectByKey("Circle");
            break;
        case 2:
            this.addObjectByKey("Rectangle");
            break;    
    }
    this.mNumOfObj -= 1;
};


    
MyGame.prototype.buildBorder = function()
{
    var cW = this.mCamera.getWCWidth();
    var cH = this.mCamera.getWCHeight();
    var cCent = this.mCamera.getWCCenter();
    this.buildCeil(cCent, cW, cH);
    this.buildWall(cCent, cW, cH);
};

MyGame.prototype.buildCeil = function(cCent, cW, cH)
{
    var temp = new Platform(this.kPlat, 40, 50);
    var pW = temp.getWidth() / 2;
    var pH = temp.getHeight() / 2;
    
    var k = Math.ceil(cW/(pW*2));
    var startX = cCent[0] - cW/2;
    var startY = cCent[1] + cH/2;
    this.oneRow(startX, startY-pH, pW, k, 180);
    var startY = cCent[1] - cH/2;
    this.oneRow(startX, startY+pH, pW, k, 0);
};
MyGame.prototype.oneRow = function(x, y, pW, k, r)
{
    for(var i = 0; i < k; i++)
    {
        var temp = new Platform(this.kPlat, (x+pW+(pW*(i*2))), y, r);
        this.mBorder.addToSet(temp);
    }
};

MyGame.prototype.buildWall = function(cCent, cW, cH)
{
    var temp = new Pillar(this.kWall, 40, 50);
    var pW = temp.getWidth() / 2;
    var pH = temp.getHeight() / 2;
    
    var k = Math.ceil(cH/(pH*2));
    var startX = cCent[0] - cW/2;
    var startY = cCent[1] - cH/2;
    this.oneCol(startX+pW, startY, pH, k);
    var startX = cCent[0] + cW/2;
    this.oneCol(startX-pW, startY, pH, k);
};
MyGame.prototype.oneCol = function(x, y, pH, k)
{
    for(var i = 0; i < k; i++)
    {
        var temp = new Pillar(this.kWall, x,(y+pH+(pH*(i*2))));
        this.mBorder.addToSet(temp);
    }
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();

    this.mBorder.draw(this.mCamera);
    this.mObjs.draw(this.mCamera);
    this.mTarget.draw(this.mCamera);
    this.mBalance.draw(this.mCamera);
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
};

MyGame.prototype.update = function () {
    this.mMsg.update();

    this.mTarget.update(this.mObjs.returnControlledObj());
    if(this.mImpulse){
        gEngine.Physics.processSetSet(this.mObjs, this.mObjs);}
    
    //gEngine.Physics.processSetSet(this.mObjs, this.mBorder);
    gEngine.Physics.processSetSet(this.mBorder, this.mObjs);
    gEngine.Physics.processSetSet(this.mObjs, this.mBalance);
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.B)) {
        this.mObjs.toggleVisibility();
        this.mBorder.toggleVisibility();
        this.mBalance.toggleVisibility();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) { // TOGGLE CONTROL RIGHT (UP)
        this.mObjs.toggleControl(1);} 
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) { // TOGGLE CONTROL LEFT (DOWN)
        this.mObjs.toggleControl(-1);}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P)) { // STOP OBJ COLLIDE
        this.mImpulse = !this.mImpulse;}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.V)) { // STOP MOVEMENT
        this.mMovement= !this.mMovement;}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.K)) { //INC WORLD SCALE (SMALLER)
        this.kWorldScale += 1; this.initialize();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.L)) { //DEC WORLD SCALE (LARGER)
        this.kWorldScale -= 1; this.initialize();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) { //RESET WORLD
        this.mNumOfObj = this.mDefaultObj; this.initialize();}
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.F)) { //ADD CIRC
        this.addObjectByKey("Circle");}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.G)) { //ADD RECT
        this.addObjectByKey("Rectangle");}
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.M)) {   // MASS
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up))
            this.mObjs.changeMass(1);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down))
            this.mObjs.changeMass(-1);}
        
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.R)) { // RESET
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up))
            this.mObjs.changeRestitution(.25);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down))
            this.mObjs.changeRestitution(-.25);}
        
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.F)) { // FRICTION
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up))
            this.mObjs.changeFriction(.1);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down))
            this.mObjs.changeFriction(-.1);}
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.H)) { // Jump Around
        this.mObjs.jumpAround();
    }
    this.mObjs.displayInfo();
    if(this.mMovement){ // mMove = false.. no updates = no movements;
        this.mObjs.update();
        this.mBorder.update();
        this.mBalance.update();
    }
    var msg = "";
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift))
        msg += "[R] Reset World To default Objects + Resize canvas\n[K] Make World Smaller (Inc Scale)\n[L] Make World Larger\n[F] Add Circle\n[B] Toggle Texture\n" +
            "[G] Add Rectangle\n[H] Make Objects 'Jump'\n[V] Stop Obj Movement\n[P] No Obj-Obj Collision\n"+
            "[M] + [UP] Increase Mass [M] + [DOWN] Decrease Mass\n[F] + [UP] Increase Friction [F] + [DOWN] Decrease Friction\n"+
            "[R] + [UP] Increase Restitution [R] + [DOWN] Decrease Restitution\n";
    msg += "P("+this.mImpulse + ") V(" + this.mMovement + ") [SHIFT]=SHOW INSTRUCTIONS\n";
    msg += this.mObjs.getInfo();
    msg += "   FPS: " + gEngine.GameLoop.getCurrentFPS();
    this.mMsg.setText(msg);
};

MyGame.prototype.setCanvasSize = function(pW, pH)
{
    document.getElementById("GLCanvas").width = (window.innerWidth*.65) * pW;
    document.getElementById("GLCanvas").height = window.innerHeight * pH;
};