/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, DyePack, Patrol ,Dye, GameObject, LineRenderable_BB */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kBg = "assets/bg2.png";
    /**************************************************************************/
    //  CAMERAS
    this.mCamera = null;
    this.mTopCams = null;
    /**************************************************************************/
    //  VALUES
    this.kPackDelta = 2;            // Speed of Dye Packs
    this.kTopVals = 0;              // Top Cameras
    this.kCanW = .9;                // How Much of the window Width is used
    this.kCanH = .9;                // How much of the window Height is used
    this.statTextSize = 2.5;        // Text size for the bottom stats
    this.topBuffSize = 3;           // Space between top cameras
    this.spawnRange = [120, 180];   // Range for spawn
    this.spaawnTimer = 0;           // Keep track of auto spawning 
    /**************************************************************************/
    //  TOGGLES
    this.PAUSE = false;         // Toggle Pause
    this.mShowInfo = false;     // Show info about objects
    this.mShowBord = false;     // Show borders around objects hitboxes
    this.mSpawnToggle = false;  //  
    this.mTopCamActive = [false, false, false, false];    // Auto cams
    this.mTopManActive = [true, false, false, false];    // Manually change cams
    this.mPatrolMove = true;
    /**************************************************************************/
    //  OBJECTS
    this.mDyePack = new GameObjectSet();
    this.mPatrols = new GameObjectSet();
    this.mBg = null;
    /**************************************************************************/
    //  MESSAGES
    this.mChar = null;
    this.mMsg = null;
    this.mPause = null;
    this.mPMsg = null;
}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kBg);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kBg);
    gEngine.Core.cleanUp(); // release gl resources
};
MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.setCanvasSize(this.kCanW,this.kCanH);
    var canvas = document.getElementById("GLCanvas");
    this.mChar = new Dye(this.kMinionSprite);
    
    var mCamHeight = canvas.height * .8;
    this.mCamera = new Camera(
        vec2.fromValues(35, 50),    // position of the camera
        200,                        // width of camera
        [0, 0, canvas.width, mCamHeight] // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]); // sets the background to gray
            
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
    this.mPause.setTextHeight(this.statTextSize);
    

    this.mPMsg = new FontRenderable("");
    this.mPMsg.setColor([1, 1, 1, 1]);
    this.mPMsg.getXform().setPosition(msgX, msgY + this.statTextSize);
    this.mPMsg.setTextHeight(this.statTextSize);
    
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
    this.mPatrols.draw(camera);
    if(this.PAUSE)
        this.mPause.draw(camera);
};



MyGame.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.3, 0.3, 0.3, 1.0]); // clear to light gray
    this.drawCamera(this.mCamera);    
    this.mMsg.draw(this.mCamera);
    this.mPMsg.draw(this.mCamera);
    for(var i = 0; i <= this.mTopCams.length; i++)
    {
        if(this.mTopCamActive[i] === true || this.mTopManActive[i] === true)
            this.drawCamera(this.mTopCams[i]);
    }
};


MyGame.prototype.update = function () {
    this.mTopCams[0].panTo(this.mChar.getXform().getXPos(), this.mChar.getXform().getYPos());

    if(!this.PAUSE)
    {
        if(this.mSpawnToggle)
        {
            this.autoSpawn();
        }
        
        var heroPos = this.mChar.getXform().getPosition();
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space))  
        {
            this.mDyePack.addToSet(new DyePack(this.kMinionSprite, 
                                                    heroPos[0], 
                                                    heroPos[1],
                                                    this.kPackDelta,
                                                    this.mShowBord));
        }
        
        this.mDyePack.update();
        this.mPatrols.update();
        this.mChar.update(this.mCamera);
        this.checkForCollide();
        
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
            this.mDyePack.slowDown();}
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.S)) {
            this.mDyePack.triggerShake();}
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.C)) {
            this.spawnPatrol();}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.J)) {
            this.mPatrols.triggerShake();
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.P))
        {
            this.mSpawnToggle = !this.mSpawnToggle;
            this.spawnTimer = (Math.random()*this.spawnRange[1]) + this.spawnRange[0];
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.U)){
            this.mPatrols.toggleMovement();
            this.mPatrolMove = !this.mPatrolMove;}
    }

    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.I))
    {
        this.PAUSE = !this.PAUSE;
        this.mShowInfo = !this.mShowInfo;
        this.setInfo();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Zero)) {
        this.mTopManActive[0] = !this.mTopManActive[0];}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.One)) {
        this.mTopManActive[1] = !this.mTopManActive[1];} 
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Two)) {
        this.mTopManActive[2] = !this.mTopManActive[2];} 
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Three)) {
        this.mTopManActive[3] = !this.mTopManActive[3];}
    
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
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Up)) {
        this.kPackDelta += .1;}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Down)) {
        this.kPackDelta -= .1;}
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.B)) {
        this.showBorders();}
    
    this.mDyePack.checkPacks(this.mCamera);
    this.mPatrols.checkPatrols(this.mCamera);
    this.mPatrols.checkPatrolBounds(this.mCamera);
    this.setMessage();
    if(this.PAUSE)
        this.pauseMessage();
    this.topCamCheck();
    this.mCamera.update();
};

MyGame.prototype.setInfo = function()
{
    this.mChar.setInfo(this.mShowInfo);
    this.mDyePack.setInfo(this.mChar.showInfo());
    this.mPatrols.setInfo(this.mChar.showInfo());
};

MyGame.prototype.setMessage = function ()
{
    var x = this.mCamera.mouseWCX();
    var y = this.mCamera.mouseWCY();
    var canvas = document.getElementById("GLCanvas");
    var msg = "MousePos: ";
    msg += "[" + x.toPrecision(4) + " " + y.toPrecision(4) + "]";
    //msg += " Canvas (px): [" + canvas.width + " " + canvas.height + "]";
    msg += " | Packs: " + this.mDyePack.size();
    msg += " | Pats: " + this.mPatrols.size();
    msg += " | A-Spawn: " + this.mSpawnToggle;
    msg += " | Speed: " + this.kPackDelta.toPrecision(2);
    msg += " | P.Move: " + this.mPatrolMove;
    
    this.mMsg.setText(msg);
    msg = "'I' to Pause | 'B' to Bound | 'U' to Pat Start/Stop";
    msg += " | 'S' Shake Pack | 'J' Shake Patrol";
    this.mPMsg.setText(msg);
};

MyGame.prototype.pauseMessage = function()
{
    var msg = "Up: +Default Speed | Down: -Default Speed |";
    msg += " Left: -Current Speed | Right: +Current Speed";
    this.mPMsg.setText(msg);
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
    var top = this.mCamera.getWCCenter()[1];
    var bot = this.mCamera.getWCHeight()/4;
    var mX = left + (Math.random() * left);
    var mY = (Math.random() * bot) + top - (Math.random() * bot);
    
    this.mPatrols.addToSet(new Patrol(this.kMinionSprite, 
                                                    mX, 
                                                    mY,
                                                    this.kPackDelta,
                                                    this.mShowBord,
                                                    this.mPatrolMove));
};

MyGame.prototype.checkForCollide = function()
{
    this.mPatrols.checkForCollide(this.mDyePack);
    this.mPatrols.checkForDyeCollide(this.mChar);
};

MyGame.prototype.topCamCheck = function()
{
    var c = this.mDyePack.getCurInbound();
    var debug = "";
    this.mTopCams[0].update();
    for(var i = 0; i < 3; i++)
    {  
        debug += i + ": " + c[i] + "<br>";
        if(c[i] >= 0)
        {
            var obj = this.mDyePack.getObjectAt(c[i]);
            this.mTopCams[i+1].setWCCenter(obj.getPosition()[0], obj.getPosition()[1]);
            this.mTopCams[i+1].update();
            this.mTopCamActive[i+1] = true;
        }
        else
        {
            this.mTopCamActive[i+1] = false;
        }
    }
    document.getElementById('debug').innerHTML = debug;
};

MyGame.prototype.showBorders = function()
{
    this.mShowBord = !this.mShowBord;
    this.mChar.showBorder(this.mShowBord);
    this.mPatrols.showBorder();
};

MyGame.prototype.autoSpawn = function()
{
    this.spawnTimer--;
    if(this.spawnTimer <= 0)
    {
        this.spawnPatrol();
        this.spawnTimer = (Math.random()*this.spawnRange[1]) + this.spawnRange[0];
    }
};