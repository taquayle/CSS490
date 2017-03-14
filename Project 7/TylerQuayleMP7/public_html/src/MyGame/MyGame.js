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
    /**************************************************************************/
    // ASSETS
    this.aMinionSprite =    "assets/minion_sprite.png";
    this.aWall =            "assets/wall.png";
    this.aPlat =            "assets/platform.png";
    this.aPlatInv =         "assets/platform_inv.png";
    this.aTarg =            "assets/target.png";
    /**************************************************************************/
    // CAMERA & SETTINGS
    this.cCamera = null;        // Main camera
    this.cWinSizeWidth = .99;   // % Amount of screen width to take up
    this.cWinSizeHeight = .95;  // % Amount of screen height to take up
    this.cWorldScale = 10;      // 1/this scale. Higher number WC = less
    /**************************************************************************/
    // TOGGLES
    this.tImpulse = true;       //  Collision Detection between objects
    this.tMovement = true;      //  Toggle movement of objects
    /**************************************************************************/
    // OBJECTS
    this.oObjs = null;          //  GameObjectSet, Circles/Rectangles
    this.oBorder = null;        //  Border, Platform/Pillars
    this.oBalance = null;       //  Balance Beams, Platform
    this.oTarget = null;        //  Target texture for current control
    this.oMsg = null;           //  Main msg
    /**************************************************************************/
    // CAMERA SETTINGS
    this.sCircAndRec = 0;       // 0 = both, 1 = only circles, 2 = only rectangles
    this.sDefaultObj = 10;      // When 'r' is pressed, this will be how many are shown
    this.sNumOfObj = 10;        // First time game starts, this amount
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.aMinionSprite);
    gEngine.Textures.loadTexture(this.aWall);
    gEngine.Textures.loadTexture(this.aPlat);
    gEngine.Textures.loadTexture(this.aPlatInv);
    gEngine.Textures.loadTexture(this.aTarg);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.aMinionSprite);
    gEngine.Textures.unloadTexture(this.aWall);
    gEngine.Textures.unloadTexture(this.aPlat);
    gEngine.Textures.unloadTexture(this.aPlatInv);
    gEngine.Textures.unloadTexture(this.aTarg);
};

MyGame.prototype.initialize = function () {
    /**************************************************************************/
    // CAMERA SETUP
    this.setCanvasSize(this.cWinSizeWidth ,this.cWinSizeHeight);
    var can =  document.getElementById("GLCanvas");
    if(this.cWorldScale > 10)
        this.cWorldScale = 10;
    if(this.cWorldScale <= 2)
        this.cWorldScale = 2;
    var scale = can.width * (1/this.cWorldScale);
    this.cCamera = new Camera(
        vec2.fromValues(50, 40), // position of the camera
        scale,                     // width of camera
        [0, 0, can.width, can.height]         // viewport (orgX, orgY, width, height)
    );
    this.cCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    /**************************************************************************/
    // MSG SETUP
    this.oMsg = new PrintHandler(this.cCamera);
    
    /**************************************************************************/
    // BUILD BORDER
    this.oBorder = new GameObjectSet();
    this.buildBorder();
    this.oBorder.addToSet(new Platform(this.aPlat, 30, 40, -30));
    this.oBorder.addToSet(new Platform(this.aPlat, 60, 30, 0));
    this.oBorder.addToSet(new Platform(this.aPlat, 20, 20, 0));
    this.oBorder.addToSet(new Platform(this.aPlat, 70, 50,0));
    
    /**************************************************************************/
    // OBJECT SETUP
    this.oObjs = new GameObjectSet();
    for(var i = 0; i < this.sNumOfObj; i++)
        this.addObject();
    this.oObjs.toggleControl(0);
    
    /**************************************************************************/
    // TARGET SETUP
    this.oTarget = new Target(this.aTarg, 0, 0);
    
    /**************************************************************************/
    // BALANCE SETUP
    this.oBalance = new GameObjectSet();
    this.oBalance.addToSet(new Platform(this.aPlatInv, 20, 65, 0));
    this.oBalance.addToSet(new Platform(this.aPlatInv, 90, 20, 0));
};



MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.cCamera.setupViewProjection();
    this.oBorder.draw(this.cCamera);
    this.oObjs.draw(this.cCamera);
    this.oTarget.draw(this.cCamera);
    this.oBalance.draw(this.cCamera);
    this.oMsg.draw(this.cCamera);   
};

MyGame.prototype.update = function () {
    this.oMsg.update();

    if(this.tImpulse){
        gEngine.Physics.processSetSet(this.oObjs, this.oObjs);}

    /**************************************************************************/
    // PROCESS PHYSICS
    gEngine.Physics.processSetSet(this.oBorder, this.oObjs);
    gEngine.Physics.processSetSet(this.oObjs, this.oBalance);
    /**************************************************************************/
    // TOGGLE VISIBILITY
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.B)) {
        this.oObjs.toggleVisibility();
        this.oBorder.toggleVisibility();
        this.oBalance.toggleVisibility();}
    /**************************************************************************/
    // SWITCH CONTROL OBJECT
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) { // TOGGLE CONTROL RIGHT (UP)
        this.oObjs.toggleControl(1);} 
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) { // TOGGLE CONTROL LEFT (DOWN)
        this.oObjs.toggleControl(-1);}
    /**************************************************************************/
    // TOGGLE MOVEMENT/COLLISIONS
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P)) { // STOP OBJ COLLIDE
        this.tImpulse = !this.tImpulse;}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.V)) { // STOP MOVEMENT
        this.tMovement= !this.tMovement;}
    /**************************************************************************/
    // SCALE/RESET WORLD
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.K)) { //INC WORLD SCALE (SMALLER)
        this.cWorldScale += 1; this.initialize();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.L)) { //DEC WORLD SCALE (LARGER)
        this.cWorldScale -= 1; this.initialize();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) { //RESET WORLD
        this.sNumOfObj = this.sDefaultObj; this.initialize();}
    /**************************************************************************/
    // CIRCLE/OBJECT CREATION
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.F)) { //ADD CIRC
        this.addObjectByKey("Circle");}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.G)) { //ADD RECT
        this.addObjectByKey("Rectangle");}
    /**************************************************************************/
    // CHANGE MASS
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.M)) {   // MASS
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up))
            this.oObjs.changeMass(1);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down))
            this.oObjs.changeMass(-1);}
    /**************************************************************************/
    // CHANGE RESTITUTION   
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.R)) { // RESET
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up))
            this.oObjs.changeRestitution(.25);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down))
            this.oObjs.changeRestitution(-.25);}
    /**************************************************************************/
    // CHANGE FRICTION
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.F)) { // FRICTION
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up))
            this.oObjs.changeFriction(.1);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down))
            this.oObjs.changeFriction(-.1);}
    /**************************************************************************/
    // JUMP AROUND
    if(gEngine.Input.isKeyPressed(gEngine.Input.keys.H)) { // Jump Around
        this.oObjs.jumpAround();
    }
    
    /**************************************************************************/
    // INFORMATION FUNCTIONS / OUPUT
    this.oObjs.displayInfo();
    var msg = "";
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift))
        msg += "[R] Reset World To default Objects + Resize canvas\n[K] Make World Smaller (Inc Scale)\n[L] Make World Larger\n[F] Add Circle\n[B] Toggle Texture\n" +
            "[G] Add Rectangle\n[H] Make Objects 'Jump'\n[V] Stop Obj Movement\n[P] No Obj-Obj Collision\n"+
            "[M] + [UP] Increase Mass [M] + [DOWN] Decrease Mass\n[F] + [UP] Increase Friction [F] + [DOWN] Decrease Friction\n"+
            "[R] + [UP] Increase Restitution [R] + [DOWN] Decrease Restitution\n";
    msg += "P("+this.tImpulse + ") V(" + this.tMovement + ") [SHIFT]=SHOW INSTRUCTIONS\n";
    msg += this.oObjs.getInfo();
    msg += "   FPS: " + gEngine.GameLoop.getCurrentFPS();
    this.oMsg.setText(msg);
    
    /**************************************************************************/
    // UPDATE OBJECTS
    if(this.tMovement){ // tMove = false.. no updates = no movements;
        this.oObjs.update();
        this.oBorder.update();
        this.oBalance.update();
    }
    this.oTarget.update(this.oObjs.returnControlledObj()); // Update location of target
};
