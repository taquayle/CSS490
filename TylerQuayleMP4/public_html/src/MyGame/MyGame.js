/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, DyePack, Dye, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.canW = .9;
    this.canH = .9;
    // The camera to view the scene
    this.mCamera = null;
    this.mTopCams = null;
    this.kTopVals = 0;
    this.mMsg = null;
    
    this.kMinionSprite = "assets/minion_sprite.png";

    this.temp = 0;
    this.mPackDelta = 1.5;
    this.mChar = null;
    this.mDyePack = new GameObjectSet();
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
};
MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.setCanvasSize(this.canW,this.canH);
    var canvas = document.getElementById("GLCanvas");
    this.mChar = new Dye(this.kMinionSprite);
    
    var mCamHeight = canvas.height * .8;
    this.mCamera = new Camera(
        vec2.fromValues(35, 50), // position of the camera
        200,                       // width of camera
        [0, 0, canvas.width, mCamHeight]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    this.mTopCams = [];
    var mTopCamWidth = canvas.width / 4;
    for(var i = 0; i < 4; i++)
    {
        var tempCamera = new Camera(
        vec2.fromValues(35, 50), // position of the camera
        50,                       // width of camera
        [   (mTopCamWidth*i)+4,                 // orgX
            mCamHeight+4,                       // orgY
            mTopCamWidth-4,                     // width
            (canvas.height - mCamHeight)-4]);   // height
        tempCamera.setBackgroundColor([.8, .8, .8, 1]);
        this.mTopCams.push(tempCamera);
    }
    
    var mCCenter = this.mCamera.getWCCenter();
    var mCWidth = this.mCamera.getWCWidth();
    var mCHeight = this.mCamera.getWCHeight();
    var msgX = mCCenter[0] - (mCWidth/2) + 3;
    var msgY = mCCenter[1] - (mCHeight/2) + 3;
    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(msgX, msgY);
    this.mMsg.setTextHeight(3);
    
    this.mPackDelta = 1.5;
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    
    this.mCamera.setupViewProjection();
    this.mChar.draw(this.mCamera);
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    this.mDyePack.draw(this.mCamera);
    for(var i = 0; i <= this.kTopVals; i++)
    {
        this.mTopCams[i].setupViewProjection();
        this.mChar.draw(this.mTopCams[i]);
        this.mDyePack.draw(this.mTopCams[i]);
    }
        
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
            // create dye pack and remove the expired ones ...
    var heroPos = this.mChar.getXform().getPosition();
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space))  
    {
        this.mDyePack.addToSet(new DyePack(this.kMinionSprite, 
                                                heroPos[0], 
                                                heroPos[1],
                                                this.mPackDelta));
    }
    //this.mTopCams[3].setWCCenter(this.mDyePack[0].getXForm().getXPos(), heroPos[1]);
    this.mDyePack.update();
    this.mDyePack.checkPacks(this.mCamera);
    this.mChar.update(this.mCamera);
    this.setMessage();
    this.mTopCams[0].panTo(this.mChar.getXform().getXPos(), this.mChar.getXform().getYPos());
    if(this.mDyePack.size() > 0)
    {
        var obj = this.mDyePack.getObjectAt(0);
        var x = obj.getXform().getXPos();
        var y = obj.getXform().getYPos();
        this.mTopCams[0].panTo(x, y);
    }
    
        
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) 
    {
        this.mDyePack.slowDown();
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Zero)) 
    {
        this.kTopVals = 0;
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.One)) 
    {
        this.kTopVals = 1;
    }    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Two)) 
    {
        this.kTopVals = 2;
    }    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Three)) 
    {
        this.kTopVals = 3;
    }
};

MyGame.prototype.setMessage = function ()
{
    var x = this.mCamera.mouseWCX();
    var y = this.mCamera.mouseWCY();
    var canvas = document.getElementById("GLCanvas");
    var msg = "MousePos: ";
    msg += "[" + x.toPrecision(4) + " " + y.toPrecision(4) + "]";
    msg += " Canvas size: [" + canvas.width + " " + canvas.height + "]";
    msg += " Dye Packs: " + this.mDyePack.size();
    this.mMsg.setText(msg);
};

MyGame.prototype.setCanvasSize = function(pW, pH)
{
    var w = window.innerWidth * pW;
    var h = window.innerHeight * pH;
    document.getElementById("GLCanvas").width = w;
    document.getElementById("GLCanvas").height = h;
};