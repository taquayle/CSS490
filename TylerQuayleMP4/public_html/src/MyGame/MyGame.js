/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, DyePack, Patrol ,Dye, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.canW = .9;
    this.canH = .9;
    this.statTextSize = 2.5;
    this.topBuffSize = 3; // Space between top cameras
    // The camera to view the scene
    this.mCamera = null;
    this.mTopCams = null;
    this.kTopVals = 0;
    this.mMsg = null;
    
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kBg = "assets/bg2.png";
    this.temp = 0;
    this.kPackDelta = 2;
    this.mChar = null;
    this.PAUSE = false;
    this.mShowInfo = false;
    this.mBg = null;
    this.mPause = null;
    this.mDyePack = new GameObjectSet();
    this.mPatrol = new GameObjectSet();
}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    
    //gEngine.Textures.loadTexture(this.kMinionPortal);
    gEngine.Textures.loadTexture(this.kBg);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kBg);
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
        [   (mTopCamWidth*i) +  this.topBuffSize,   // orgX
            mCamHeight +        this.topBuffSize,   // orgY
            mTopCamWidth -      this.topBuffSize,   // width
            (canvas.height - mCamHeight) - this.topBuffSize]);   // height
        tempCamera.setBackgroundColor([.8, .8, .8, 1]);
        tempCamera.configInterpolation(0.7, 10);
        this.mTopCams.push(tempCamera);
    }
    
    var mCCenter = this.mCamera.getWCCenter();
    var mCWidth = this.mCamera.getWCWidth();
    var mCHeight = this.mCamera.getWCHeight();
    var msgX = mCCenter[0] - (mCWidth/2) + this.statTextSize;
    var msgY = mCCenter[1] - (mCHeight/2) + this.statTextSize;
    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([1, 1, 1, 1]);
    this.mMsg.getXform().setPosition(msgX, msgY);
    this.mMsg.setTextHeight(this.statTextSize);
    

    this.mPause = new FontRenderable("PAUSED");
    this.mPause.setColor([1, 1, 1, 1]);
    this.mPause.getXform().setPosition(mCCenter[0], mCCenter[1]);
    this.mPause.setTextHeight(3);
    
    var bgR = new SpriteRenderable(this.kBg);
    bgR.setElementPixelPositions(0, 2048, 0, 2048);
    bgR.getXform().setSize(this.mCamera.getWCWidth(), this.mCamera.getWCHeight());
    bgR.getXform().setPosition(35, 50);
    this.mBg = new GameObject(bgR);
};

MyGame.prototype.drawCamera = function (camera) {
    camera.setupViewProjection();
    this.mBg.draw(camera);
    this.mChar.draw(camera);
    this.mDyePack.draw(camera);
    this.mPatrol.draw(camera);
    this.mMsg.draw(camera);
    if(this.PAUSE)
        this.mPause.draw(camera);
};


// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.3, 0.3, 0.3, 1.0]); // clear to light gray
    this.drawCamera(this.mCamera);    
    for(var i = 0; i <= this.kTopVals; i++)
    {
        this.drawCamera(this.mTopCams[i]);
    }
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    this.mTopCams[0].panTo(this.mChar.getXform().getXPos(), this.mChar.getXform().getYPos());
    if(this.mDyePack.size() > 0)
    {
        var obj = this.mDyePack.getObjectAt(0);
        var x = obj.getXform().getXPos();
        var y = obj.getXform().getYPos();
        this.mTopCams[0].panTo(x, y);
        this.mCamera.panTo(x,y);
    }
    
    if(!this.PAUSE)
    {
        var heroPos = this.mChar.getXform().getPosition();
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space))  
        {
            this.mDyePack.addToSet(new DyePack(this.kMinionSprite, 
                                                    heroPos[0], 
                                                    heroPos[1],
                                                    this.kPackDelta));
        }
    
        this.mDyePack.update();
        this.mPatrol.update();
        this.mChar.update(this.mCamera);
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) 
        {
            this.mDyePack.slowDown();
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.S)) 
        {
            this.mDyePack.triggerShake();
        }
        
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.C)) 
        {
            this.spawnPatrol();
        }
    }

    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P))
    {
        this.PAUSE = !this.PAUSE;
        this.mShowInfo = !this.mShowInfo;
        this.setInfo();
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
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) 
    {
        this.mDyePack.slowDown();
        this.mDyePack.updateInfo();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) 
    {
        this.mDyePack.speedUp();
        this.mDyePack.updateInfo();
    }
    
    this.mDyePack.checkPacks(this.mCamera);
    this.mPatrol.checkPatrolBounds(this.mCamera);
    this.setMessage();
    
};

MyGame.prototype.setInfo = function()
{
    this.mChar.setInfo(this.mShowInfo);
    this.mDyePack.setInfo(this.mChar.showInfo());
    this.mPatrol.setInfo(this.mChar.showInfo());
};

MyGame.prototype.setMessage = function ()
{
    var x = this.mCamera.mouseWCX();
    var y = this.mCamera.mouseWCY();
    var canvas = document.getElementById("GLCanvas");
    var msg = "MousePos: ";
    msg += "[" + x.toPrecision(4) + " " + y.toPrecision(4) + "]";
    msg += " Canvas size (px): [" + canvas.width + " " + canvas.height + "]";
    msg += " Dye Packs: " + this.mDyePack.size();
    msg += " Patrols: " + this.mPatrol.size();
    this.mMsg.setText(msg);
};

MyGame.prototype.setCanvasSize = function(pW, pH)
{
    var w = window.innerWidth * pW;
    var h = window.innerHeight * pH;
    document.getElementById("GLCanvas").width = w;
    document.getElementById("GLCanvas").height = h;
};

MyGame.prototype.spawnPatrol = function()
{
    var left = this.mCamera.getWCCenter()[0];
    var top = this.mCamera.getWCCenter()[1] + (this.mCamera.getWCHeight()/2) * .75;
    var bot =  this.mCamera.getWCCenter()[1] - (this.mCamera.getWCHeight()/2) * .75;
    var mX = left + (Math.random() * left);
    var mY = (Math.random() * top) + bot;
    
    this.mPatrol.addToSet(new Patrol(this.kMinionSprite, 
                                                    mX, 
                                                    mY,
                                                    this.kPackDelta));
};