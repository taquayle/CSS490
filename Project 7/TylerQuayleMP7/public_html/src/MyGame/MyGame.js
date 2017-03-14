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
    this.kTarg = "assets/target.png";
    
    // The camera to view the scene
    this.mCamera = null;
    this.mImpulse = true;
    this.mMsg = null;

    this.mObjs = null;
    this.mBorder = null;
    this.mTarget = null;
    
    this.mNumOfObj = 4;
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kWall);
    gEngine.Textures.loadTexture(this.kPlat);
    gEngine.Textures.loadTexture(this.kTarg);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kWall);
    gEngine.Textures.unloadTexture(this.kPlat);
    gEngine.Textures.unloadTexture(this.kTarg);
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 40), // position of the camera
        100,                     // width of camera
        [0, 0, 800, 600]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    var msg = "hello world \nhello computer";
    this.mMsg = new PrintHandler(this.mCamera, msg);
    this.mBorder = new GameObjectSet();
    this.buildBorder();
    this.mBorder.addToSet(new Platform(this.kPlat, 50, 40, 30));
    this.mObjs = new GameObjectSet();
    for(var i = 0; i < this.mNumOfObj; i++)
        this.addObject();
    this.mObjs.toggleControl(0);
    this.mTarget = new Target(this.kTarg, 0, 0);
};

MyGame.prototype.addObject = function()
{
    var pX = this.mCamera.getWCWidth()-40;
    var pY = this.mCamera.getWCHeight()-40;
    if(Math.random() >= .5)
        this.mObjs.addToSet(new Circ(this.kMinionSprite, Math.random()*pX+20, Math.random()*pY+20));
    else
        this.mObjs.addToSet(new Rect(this.kMinionSprite, Math.random()*pX+20, Math.random()*pY+20));
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
    //this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    this.mBorder.draw(this.mCamera);
    this.mObjs.draw(this.mCamera);
    this.mTarget.draw(this.mCamera);
};

MyGame.prototype.update = function () {
    this.mMsg.update();

    this.mTarget.update(this.mObjs.returnControlledObj());
    if(this.mImpulse){
        gEngine.Physics.processSetSet(this.mObjs, this.mObjs);}
    
    //gEngine.Physics.processSetSet(this.mObjs, this.mBorder);
    gEngine.Physics.processSetSet(this.mBorder, this.mObjs);
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.B)) {
        this.mObjs.toggleVisibility();
        this.mBorder.toggleVisibility();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
        this.mObjs.toggleControl(1);}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
        this.mObjs.toggleControl(-1);}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P)) {
        this.mImpulse = !this.mImpulse;}
    this.mObjs.displayInfo();
    this.mObjs.update();
    this.mBorder.update();
};