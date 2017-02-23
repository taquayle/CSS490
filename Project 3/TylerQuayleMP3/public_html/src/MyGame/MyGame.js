/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, SpriteRenderable: false, Camera: false, vec2: false,
  TextureRenderable: false, Renderable: false, SpriteAnimateRenderable: false, GameOver: false,
  FontRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    
    this.mConstColorShader = null;
    // textures: 
    this.resourceName = "imager";
    this.kImage;
    this.kBound = "assets/Bound.png";

    this.frameNums = 5;
    this.aspectRatioPercent = .9;
    this.delta = .5;
    
    this.mCamWidth = 440;
    // The camera to view the scene
    this.mCamera = null;
    this.animCamera = null;
    this.zoomCamera = null;

    this.slow;
    this.showFrames;

    // the hero and the support objects
    this.mIntBound = null;
        this.mIntBoundAdd = null;
        this.mIntBoundSq = null;
    this.mFontImage = null;
    this.mAnim = null;
    this.mImage = null;
        this.mImageSq = null;
    this.borders = null;
    
    this.mMsg = null;
    this.mFile = null;
}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    // Step A: loads the textures    

    gEngine.ResourceMap.loadImage(this.resourceName);
    
    gEngine.Textures.loadTexture(gEngine.ResourceMap.retrieveAsset(this.resourceName));
    gEngine.Textures.loadTexture(this.kBound);

    // Step B: loads all the fonts
};

MyGame.prototype.unloadScene = function () {
    
    gEngine.Textures.unloadTexture(gEngine.ResourceMap.retrieveAsset(this.resourceName));
    gEngine.ResourceMap.unloadImage(this.resourceName);
    gEngine.Textures.unloadTexture(this.kBound);
    
    // unload the fonts

    // Step B: starts the next level
    var nextLevel = new MyGame();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.kImage = gEngine.ResourceMap.retrieveAsset(this.resourceName);
    //document.getElementById("debug").innerHTML = this.kImage;
    this.slow = false;
    this.showFrames = false;
    this.mImageSq = [];
    this.mIntBoundSq = [];
    var canvas = document.getElementById('GLCanvas');

    this.mConstColorShader = new SimpleShader(
        "src/GLSLShaders/SimpleVS.glsl",      // Path to the VertexShader 
        "src/GLSLShaders/SimpleFS.glsl");    // Path to the Simple FragmentShader 

    var animDimension = (canvas.width - this.mCamWidth); //WxH of anim camera
    this.mCamera = new Camera(
        vec2.fromValues(10, 10),   // position of the camera
        100,                       // width of camera
        [animDimension, 0, this.mCamWidth, canvas.height]           
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);

/********************* START INT BOUND BOXES **********************************/
    this.mIntBound = new SpriteRenderable(this.kBound);
    this.mIntBound.setColor([1, 1, 1, 0]);
    this.mIntBound.getXform().setPosition(10, 10);
    this.mIntBound.getXform().setSize(15, 15);
    this.mIntBound.setElementPixelPositions(0, 512, 0, 512);
/********************* END INT BOUND BOXES ************************************/

/********************* START ADDTIONAL INT BOXES ******************************/
    this.mIntBoundAdd = [];
    var xC = this.mIntBound.getXform().getXPos();
    for(var i = 1; i < this.frameNums; i++)
    {
        var temp = new SpriteRenderable(this.kBound);
        temp.getXform().setPosition(xC + this.mIntBound.getXform().getWidth()*(i), 10);
        temp.getXform().setSize(20, 20);
        temp.setElementPixelPositions(0, 512, 0, 512);
        this.mIntBoundAdd.push(temp);
    };
/********************* END ADDTIONAL INT BOXES ********************************/   
    
/********************* START MAIN SPITE IMAGE *********************************/    
    this.mImage = new SpriteRenderable(this.kImage);
    this.mImage.setColor([1,1,1,0]);
    this.mImage.getXform().setPosition(10, 10);

    this.setTextureAspect(this.aspectRatioPercent);
/********************* END MAIN SPITE IMAGE ***********************************/   

/********************* START ANIM CAMERA SETUP ********************************/ 
    var vp = this.mCamera.getViewport(); // Get viewport of the main window

    this.animCamera = new Camera(
        vec2.fromValues(10, 10),
        this.mIntBound.getXform().getWidth(),                     
        [0, vp[3]-animDimension, animDimension, animDimension] 
    );
    this.animCamera.setBackgroundColor([0, 0, 0.8, 1]);
/********************* END ANIM CAMERA SETUP **********************************/     
    
    var fSize = 2.5;
    var mCamWid =   this.mCamera.getWCWidth();
    var mCamHei =   this.mCamera.getWCHeight();

    var msgX    =   (this.mCamera.getWCCenter()[0]-(mCamWid/2))+fSize;
    var msgY    =   (this.mCamera.getWCCenter()[1]-(mCamHei/2))+fSize;
    this.mMsg = new FontRenderable("default");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(msgX, msgY);
    this.mMsg.setTextHeight(fSize);
    
    var msgX    =   (this.mCamera.getWCCenter()[0]-(mCamWid/2))+fSize;
    var msgY    =   (this.mCamera.getWCCenter()[1]+(mCamHei/2))-fSize;
    var msg = "Press 'E' to change - Current File: " + this.kImage;
    this.mFile = new FontRenderable(msg);
    this.mFile.setColor([0, 0, 0, 1]);
    this.mFile.getXform().setPosition(msgX, msgY);
    this.mFile.setTextHeight(fSize);
    
    this.mAnim = new SpriteAnimateRenderable(this.kImage);
    this.mAnim.setColor([1, 1, 1, 0]);
    this.mAnim.getXform().setPosition(10, 10);
    this.mAnim.getXform().setSize(20, 20);

    this.mAnim.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateRight);
    this.mAnim.setAnimationSpeed(15);
    
    this.setImageBorderSquares();
    this.setInteractiveBorderSquares();
    this.setZoomCamera(canvas);
};



MyGame.prototype.setTextureAspect = function(aspect)
{
    var texInfo = gEngine.ResourceMap.retrieveAsset(this.kImage);
    var rWidth = this.mCamera.getWCWidth() * aspect;
    var rHeight = rWidth * (texInfo.mHeight/texInfo.mWidth);
    this.mImage.getXform().setSize(rWidth, rHeight);
};

MyGame.prototype.setInteractiveBorderSquares = function()
{
    var xform = this.mIntBound.getXform();
    var x = xform.getXPos();
    var y = xform.getYPos();
    var w = xform.getWidth()/2;
    var h = xform.getHeight()/2;
    var xCoords = [x-w, x+w, x, x];
    var yCoords = [y, y, y-h, y+h];
    var temp = new Renderable(this.mConstColorShader);
    for(var i = 0; i < 4; i++)
    {
        temp = new Renderable(this.mConstColorShader);
        temp.setColor([Math.random(), Math.random(), Math.random(), 1]);
        temp.getXform().setPosition(xCoords[i], yCoords[i]);
        temp.getXform().setSize(1, 1);
        this.mIntBoundSq.push(temp);
    }
    
    this.setAnimationWCPos(xform);
    
};

/******************************************************************************/
// setImageBorderSquares()
//  set all the boxes and lines surrounding the main sprite image
/******************************************************************************/
MyGame.prototype.setImageBorderSquares = function()
{
    var xform = this.mImage.getXform();
    var x = xform.getXPos();
    var y = xform.getYPos();
    var w = xform.getWidth()/2;
    var h = xform.getHeight()/2;

    var xSides = [x, x, x+w, x-w];
    var ySides = [y+h, y-h, y, y];
    var barLR = [w*2, w*2, .25, .25];
    var barTB = [.25, .25, h*2, h*2];
    var temp = new Renderable(this.mConstColorShader);
    for(var i = 0; i < 4; i++)      // FOR LOOP, BORDER LINES
    {
        temp = new Renderable(this.mConstColorShader);
        temp.setColor([0, 0, 0, 1]);
        temp.getXform().setPosition(xSides[i], ySides[i]);
        temp.getXform().setSize(barLR[i], barTB[i]);
        this.mImageSq.push(temp);
    }
    
    var xCorner = [x+w, x-w, x-w, x+w];
    var yCorner = [y+h, y+h, y-h, y-h];
    for(var i = 0; i < 4; i++)      // FOR LOOP, CORNER BOXES
    {
        temp = new Renderable(this.mConstColorShader);
        temp.setColor([Math.random(), Math.random(), Math.random(), 1]);
        temp.getXform().setPosition(xCorner[i], yCorner[i]);
        temp.getXform().setSize(4, 4);
        this.mImageSq.push(temp);
    }

    this.updateBorders(xform);
};

MyGame.prototype.setZoomCamera = function(canvas)
{
    this.zoomCamera = [];
    var zWidth = canvas.width - this.mCamWidth; //Gives the 'whitespace' to the left
    var zHeight = canvas.height - this.animCamera.getViewport()[3];
    var zCamsWidth = zWidth / 2;
    var zCamsHeight = zHeight / 3;
    var camPos =   [0, zHeight/3,
                    zWidth/2, zHeight/3,
                    zWidth/4, 0,
                    zWidth/4, ((zHeight*2)/3)];
    for(var i = 0; i < 4; i++)
    {
        var xform = this.mIntBoundSq[i].getXform();
        var tempCamera = new Camera(
        vec2.fromValues(xform.getXPos(),xform.getYPos()),   // position of the camera
        10,                       // width of camera
        [camPos[i*2], camPos[i*2+1], zCamsWidth, zCamsHeight]
        );
        this.zoomCamera.push(tempCamera);
   }

};

MyGame.prototype._initText = function (font, posX, posY, color, textH) {
    font.setColor(color);
    font.getXform().setPosition(posX, posY);
    font.setTextHeight(textH);
};

/******************************************************************************/
// draw
/******************************************************************************/
MyGame.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    
    this.mCamera.setupViewProjection();
    this.mImage.draw(this.mCamera.getVPMatrix());
    this.mIntBound.draw(this.mCamera.getVPMatrix());
    this.mMsg.draw(this.mCamera.getVPMatrix());
    this.mFile.draw(this.mCamera.getVPMatrix());
    for(var i = 0; i < this.mImageSq.length; i++)
        this.mImageSq[i].draw(this.mCamera.getVPMatrix());
    for(var i = 0; i < this.mIntBoundSq.length; i++)
        this.mIntBoundSq[i].draw(this.mCamera.getVPMatrix());
   
    if(this.showFrames)
    {
        for(var i = 0; i < this.mIntBoundAdd.length; i++)
        {
            this.mIntBoundAdd[i].draw(this.mCamera.getVPMatrix());
        }
    }

    this.animCamera.setupViewProjection();
    this.mAnim.draw(this.animCamera.getVPMatrix());
   
    for(var i = 0; i < 4; i++) // setup and show all 4 zoom cameras
    {
        this.zoomCamera[i].setupViewProjection();
        this.mImage.draw(this.zoomCamera[i].getVPMatrix());
        this.mIntBoundSq[i].draw(this.zoomCamera[i].getVPMatrix());
        this.mIntBound.draw(this.zoomCamera[i].getVPMatrix());
    }
};

/******************************************************************************/
// update
/******************************************************************************/
MyGame.prototype.update = function () {

    var xform = this.mIntBound.getXform();


    this.updateBorders();
    
    if(!(this.manipulate(xform) || this.move(xform)))
    {
        this.mAnim.updateAnimation();
    }
    
    this.mAnim.getXform().setPosition(xform.getXPos(), xform.getYPos());
    this.animCamera.setWCCenter(xform.getXPos(), xform.getYPos());
    
    var msg = "Status: Bound Pos=(" + 
            xform.getXPos().toPrecision(4) + ", " +
            xform.getYPos().toPrecision(4) + ") Size=(" + 
            xform.getWidth().toPrecision(4) + ", " + 
            xform.getHeight().toPrecision(4) + ")";
    this.mMsg.setText(msg);
};


/******************************************************************************/
// move
//  handles the movement of the bound boxes
/******************************************************************************/
MyGame.prototype.move = function (xform) 
{

    var pressedX = false;
    var pressedY = false;

    // Support hero movements
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) 
    {
            this.slow = !this.slow;
            if(this.slow)
                this.delta = this.delta * .1;
            else
                this.delta = .5;
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) 
    {
            this.showFrames = !this.showFrames;
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) 
    {
            gEngine.GameLoop.stop();
    }
    // MOVE UP
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) 
    {
        pressedY = this.moveY(xform, 1);
    }
    
    // MOVE LEFT
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) 
    {
        pressedX = this.moveX(xform, -1);
    }
    
    //  MOVE DOWN
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) 
    {
        pressedY = this.moveY(xform, -1);
    }
    
    // MOVE RIGHT
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) 
    {
        pressedX = this.moveX(xform, 1);
    }
  
    // If the mIntBound was moved, update everything
    if(pressedY || pressedX)
    {
        this.updateZoom(xform);
        this.setAnimationWCPos(xform);
    }
    
    // If there was no movement detected, allow the animation to continue
    return (pressedY && pressedX);
};

/******************************************************************************/
// moveY
//  Move in the Y direction, check updated coordinate and undo if illegal
/******************************************************************************/
MyGame.prototype.moveY = function (xform, dir)
{
    xform.incYPosBy((this.delta * dir));
    if(!this.borderCheck(xform))// Check if new position is legal
    {    
        xform.incYPosBy((-this.delta * dir)); // illegal, undo
        return false;
    }
    this.updateIntBoundAdds(xform);
    return true;
};
/******************************************************************************/
// moveX
//  Move in the X direction, check updated coordinate and undo if illegal
/******************************************************************************/
MyGame.prototype.moveX = function (xform, dir)
{
    xform.incXPosBy((this.delta * dir));
    if(!this.borderCheck(xform)) // Check if new position is legal
    {
        xform.incXPosBy((-this.delta * dir)); // illegal, undo
        return false;
    }
    this.updateIntBoundAdds(xform);
    return true;
};

/******************************************************************************/
// manipulate
//  Handle the manipulation of the bound box
/******************************************************************************/
MyGame.prototype.manipulate = function (xform) 
{
    var pressed = false;

    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        xform.setHeight( xform.getHeight() + this.delta);
        this.updateBorders(xform);
        if (!this.borderCheck(xform))
        {
            // In case of border collision, see if bound box can move 
            // to accomadate the growth
            this.moveY(xform, -1);
            this.moveY(xform, 1);
            xform.setHeight( xform.getHeight() - this.delta);
        }
        else
            pressed = true;
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        xform.setWidth( xform.getWidth() - this.delta);
        this.updateBorders(xform);
        if (!this.borderCheck(xform)) 
            xform.setWidth( xform.getWidth() + this.delta);
            
        else
            pressed = true;
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        xform.setHeight( xform.getHeight() - this.delta);
        this.updateBorders(xform);
        if (!this.borderCheck(xform))
            xform.setHeight( xform.getHeight() + this.delta);
        
        else
            pressed = true;
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
        xform.setWidth( xform.getWidth() + this.delta);
        this.updateBorders(xform);
        if (!this.borderCheck(xform)) 
        {
            // In case of border collision, see if bound box can move 
            // to accomadate the growth
            this.moveX(xform, -1);
            this.moveX(xform, 1); 
            xform.setWidth( xform.getWidth() - this.delta);
        }
        else
            pressed = true;
    }
    
    if(pressed)
    {
        this.updateZoom(xform);
        this.setAnimationWCPos(xform);
    }
        
    return pressed;
};
/******************************************************************************/
// updateIntBoundAdds
//  Update the four colored squares surrounding the boundbox
/******************************************************************************/
MyGame.prototype.updateIntBoundAdds = function(xform)
{
    var w = xform.getWidth();
    var h = xform.getHeight();
    var x = xform.getXPos();
    var y = xform.getYPos();
    
    for(var i = 0; i < this.mIntBoundAdd.length; i++)
    {
        this.mIntBoundAdd[i].getXform().setHeight(h);
        this.mIntBoundAdd[i].getXform().setWidth(w);
        this.mIntBoundAdd[i].getXform().setXPos(x + (w * (i+1)));
        this.mIntBoundAdd[i].getXform().setYPos(y);
    }
};
/******************************************************************************/
// setAnimationWCPos()
//  Update the position of the animation sprite window
/******************************************************************************/
MyGame.prototype.setAnimationWCPos = function (xform)
{
    var w = xform.getWidth()/2;
    var h = xform.getHeight()/2;
    var x = xform.getXPos() - w;
    var y = xform.getYPos() + h;
    
    var topLeft = this.calcWCPos(x, y);
    
    x = xform.getXPos() + w;
    y = xform.getYPos() - h;
    var botRight = this.calcWCPos(x, y);
    
    this.mAnim.setSpriteSequence(   topLeft[1], // Y-VALUE OF TOP-LEFT OF FRAME
                                    topLeft[0], // X-VALUE OF TOP-LEFT OF FRAME
                                    botRight[0] - topLeft[0],// WIDTH PER FRAME
                                    topLeft[1]-botRight[1],  // HEIGHT PER FRAME
                                5,          // NUMBER OF FRAMES
                                0);         // PADDING BETWEEN FRAMES
};

// Get the Pixel values for the given UV coordinates
MyGame.prototype.calcWCPos = function (x, y)
{
    var minInfo = gEngine.ResourceMap.retrieveAsset(this.kImage);
    var mform = this.mImage.getXform();
    var fx = (.5 + ( (x - mform.getXPos() ) / mform.getWidth() ) ) * minInfo.mWidth ;
    var fy = (.5 + ( (y - mform.getYPos() ) / mform.getHeight() ) ) * minInfo.mHeight ;
    return [fx, fy];
};

// Check if the current position of xform is inside the borders
MyGame.prototype.borderCheck = function (xform)
{
    var pad = 0.0;
    if ((xform.getYPos()- pad > this.borders[2])) // UPPER
        return false;
    if ((xform.getXPos()+ pad < this.borders[0])) // LEFT
        return false;
    if ((xform.getYPos()+ pad < this.borders[3])) // LOWER
        return false;
    if ((xform.getXPos()- pad > this.borders[1])) // RIGHT
        return false;

    return true;
};

// Update the zoom box center positions
MyGame.prototype.updateZoom = function (xform)
{
    var x = xform.getXPos();
    var y = xform.getYPos();
    var w = xform.getWidth()/2;
    var h = xform.getHeight()/2;
    var xCoords = [x-w, x+w, x, x]; //LEFT, RIGHT, Y-AXIS, Y-AXIS
    var yCoords = [y, y, y-h, y+h]; // X-AXIS, X-AXIS, LOWER, UPPER
    for(var i = 0; i < 4; i++)
    {
        //Update the 4 boxes around the bound box
        this.mIntBoundSq[i].getXform().setPosition(xCoords[i], yCoords[i]);
        //Update the 4 zoom cameras
        this.zoomCamera[i].setWCCenter(xCoords[i], yCoords[i]);
    }
};

// Update the borders 
MyGame.prototype.updateBorders = function ()
{
    var xform = this.mImage.getXform();
    var x = xform.getXPos();
    var y = xform.getYPos();
    var w = xform.getWidth()/2;
    var h = xform.getHeight()/2;
    this.borders = [x - w + (this.mIntBound.getXform().getSize()[0]/2), // LEFT
                    x + w - (this.mIntBound.getXform().getSize()[0]/2), // RIGHT
                    y + h - (this.mIntBound.getXform().getSize()[1]/2), // UPPER
                    y - h + (this.mIntBound.getXform().getSize()[1]/2)];// LOWER
};

