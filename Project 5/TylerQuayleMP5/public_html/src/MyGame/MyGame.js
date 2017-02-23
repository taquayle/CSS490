/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable, Dye, Minion, PrintLine
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    /**************************************************************************/
    // ASSESTS
    this.kMinionSprite = "assets/minion_sprite.png";
    /**************************************************************************/
    // CAMERAS
    this.mCamera = null;
    /**************************************************************************/
    // OBJECTS
    this.mObj = null;
    //this.mHero;
    /**************************************************************************/
    // FONTS
    this.mMsg = null;
    /**************************************************************************/
    // SETTINGS
    this.kTextSize = 3;
    this.kDyeDelta = .5;
    this.kMinDelta = .33;
    this.kNumOfMinion = 5;
    this.kCurControl = 0;
    /**************************************************************************/
    // TOGGLES
    this.kDispInfo = true;
}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Core.cleanUp(); // release gl resources
};

MyGame.prototype.initialize = function () {
    var vas = document.getElementById("GLCanvas");
    this.mCamera = new Camera(
        vec2.fromValues(0, 0), // position of the camera
        100,                       // width of camera
        [0, 0, vas.width, vas.height]
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    
    this.setupObj();
    
    this.mObj.switchControl(this.kCurControl);
    this.mMsg = new PrintLine(this.mCamera, this.kTextSize, 1, "Default");
};

MyGame.prototype.setupObj = function()
{
    this.mObj = new GameObjectSet();
    this.mObj.addToSet(new Dye(this.kMinionSprite, this.kDyeDelta));
    for(var i = 0; i < this.kNumOfMinion; i++)
        this.mObj.addToSet(new Minion(this.kMinionSprite,this.kMinDelta,this.mCamera));
    if(this.mObj.detectCollision())
        this.setupObj();
};


MyGame.prototype.draw = function () {

    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    this.mMsg.draw(this.mCamera);
    this.mObj.draw(this.mCamera);
};


MyGame.prototype.update = function () {

    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
        this.select(1);}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
        this.select(-1);}
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        this.mObj.changeRadius(1);}
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        this.mObj.changeRadius(-1);}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.T)) {
        this.mObj.toggleTexture();}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.I)) {
        this.kDispInfo = !this.kDispInfo;}

    this.mObj.boundryCheck(this.mCamera);
    this.mObj.detectCollision();
    if(this.kDispInfo)
        this.mObj.debug(this.kCurControl);
    else
        this.mObj.clear();
    
    var echo = this.mObj.getObjectAt(this.kCurControl);
    var msg = "";
    msg += "SELECTED: " + this.kCurControl + " RADIUS: "+ echo.getRadius().toPrecision(3);
    this.mMsg.setText(msg);
    this.mObj.update();
};

MyGame.prototype.select = function(dir)
{
  this.kCurControl += dir;
  if(this.kCurControl < 0)
  {
      this.kCurControl = this.mObj.size()-1;
  }
      
  else if(this.kCurControl >= this.mObj.size())
  {
      this.kCurControl = 0;
  }
  
  this.mObj.switchControl(this.kCurControl);
};