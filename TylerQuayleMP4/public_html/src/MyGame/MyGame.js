/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, Dye, Editor,
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    // The camera to view the scene
    this.mCamera = null;

    this.mMsg = null;
    
    this.kMinionSprite = "assets/minion_sprite.png";

    this.mLineSet = [];
    this.mCurrentLine = null;
    this.mP1 = null;
    
    this.mChar = null;
}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    
    //gEngine.Textures.loadTexture(this.kMinionPortal);
    //gEngine.Textures.loadTexture(this.kBg);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Core.cleanUp(); // release gl resources
    
    var nextLevel = new Editor();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
    //gEngine.Textures.unloadTexture(this.kMinionPortal);
    //gEngine.Textures.unloadTexture(this.kBg);
};
MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.setCanvasSize(.9,.96);
    var canvas = document.getElementById("GLCanvas");
    this.mChar = new Dye(this.kMinionSprite);
    this.mCamera = new Camera(
        vec2.fromValues(30, 27.5), // position of the camera
        400,                       // width of camera
        [0, 0, canvas.width, canvas.height]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    
    var mCCenter = this.mCamera.getWCCenter();
    var mCWidth = this.mCamera.getWCWidth();
    var mCHeight = this.mCamera.getWCHeight();
    var msgX = mCCenter[0] - (mCWidth/2) + 3;
    var msgY = mCCenter[1] - (mCHeight/2) + 3;
    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(msgX, msgY);
    this.mMsg.setTextHeight(3);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    
    this.mCamera.setupViewProjection();
    this.mChar.draw(this.mCamera);
    var i, l;
    for (i = 0; i < this.mLineSet.length; i++) {
        l = this.mLineSet[i];
        l.draw(this.mCamera);
    }
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    var msg = "Lines: " + this.mLineSet.length + " ";
    var echo = "";
    var x, y;
    var canvas = document.getElementById("GLCanvas");
    var can = " Canvas size: [" + canvas.width + " " + canvas.height + "]";
    this.mChar.update(this.mCamera);

    x = this.mCamera.mouseWCX();
    y = this.mCamera.mouseWCY();
    echo += "[" + x.toPrecision(4) + " " + y.toPrecision(4) + "]";
    msg += echo + can;
    this.mMsg.setText(msg);
};

MyGame.prototype.setCanvasSize = function(pW, pH)
{
    var w = window.innerWidth * pW;
    var h = window.innerHeight * pH;
    document.getElementById("GLCanvas").width = w;
    document.getElementById("GLCanvas").height = h;
};