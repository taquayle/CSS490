/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable, Hero, Minion, PrintLine, Circle, Rectangle,
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() {
    this.kMinionSprite = "assets/minion_sprite.png";
    /**************************************************************************/
    // CAMERA
    this.mCamera = null;
    /**************************************************************************/
    // CAMERA SETTINGS
    this.kWinSizeWidth = .99;        // % Amount of screen width to take up
    this.kWinSizeHeight = .95;       // % Amount of screen height to take up
    this.kWorldScale = 10;           // 1/this scale. Higher number WC = less
    /**************************************************************************/
    // VARIABLES
    this.kAmountOfPairs = 10;
    this.kCurControl = 0;
    this.kBoundDelta = .1;
    Circle.kBoundSize = 4;
    Circle.kMoveDelta = .6;
    Circle.kMoveRandomDelta = 10;
    Circle.pointSize = 5;
    Rectangle.kBoundSize = 4;
    Rectangle.kMoveDelta = .6;
    Rectangle.pointSize = 5;
    /**************************************************************************/
    // OBJECTS
    this.mMsg = null;
    this.mMsg2 = null;
    this.mMsg3 = null;
    this.mObj = new GameObjectSet();
    this.mAllObjs = null;
    this.mHero = null;
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
};

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.setCanvasSize(this.kWinSizeWidth ,this.kWinSizeHeight);
    var can =  document.getElementById("GLCanvas");
    var scale = can.width * (1/this.kWorldScale);
    this.mCamera = new Camera(
        vec2.fromValues(50, 40), // position of the camera
        scale,                     // width of camera
        [0, 0, can.width, can.height]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    var cDim = this.mCamera.getDimensions();
    var cCen = this.mCamera.getWCCenter();
    var xL = cCen[0] - (cDim[0]/2);
    var yL = cCen[1] - (cDim[1]/2);
    var tX, tY;
    for(var i = 0; i < this.kAmountOfPairs*2; i++)
    {
        var temp = new Circle();
        tX = xL + (Math.random() * (cDim[0]) * .9);
        tY = yL + (Math.random() * (cDim[1]) * .9);
        temp.getXform().setPosition(tX,tY);
        this.mObj.addToSet(temp);
    }
    // RECTANGLES/CURRENTLY NOT WORKING
//    for(var i = 0; i < this.kAmountOfPairs*2; i++)
//    {
//        var temp = new Rectangle();
//        tX = xL + (Math.random() * (cDim[0]) * .9);
//        tY = yL + (Math.random() * (cDim[1]) * .9);
//        temp.getXform().setPosition(tX,tY);
//        this.mObj.addToSet(temp);
//    }
    this.mObj.switchControl(0);
    this.mMsg = new PrintLine(this.mCamera, 2, 1, "");
    this.mMsg2 = new PrintLine(this.mCamera, 2, 2, "SHIFT+(UP/DOWN): Inc/Dec ALL Radius");
    this.mMsg3 = new PrintLine(this.mCamera, 2, 3, "SPACE: Toggle Auto Move | SHIFT+SPACE: Toggle All");
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    this.mCamera.setupViewProjection();
    this.mObj.draw(this.mCamera);
    this.mMsg.draw(this.mCamera);   // only draw status in the main camera
    this.mMsg2.draw(this.mCamera);   // only draw status in the main camera
    this.mMsg3.draw(this.mCamera);   // only draw status in the main camera
    this.mObj.drawCollisions(this.mCamera);
};


// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () { 
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Shift)) {
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
            this.mObj.changeAllRadius(this.kBoundDelta);
        }
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
            this.mObj.changeAllRadius(-this.kBoundDelta);
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
            this.mObj.toggleAllMove();}
    }
    else{
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
            this.mObj.switchControl(1);
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
            this.mObj.switchControl(-1);
        }
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
            this.mObj.changeRadius(this.kBoundDelta);
        }
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
            this.mObj.changeRadius(-this.kBoundDelta);
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
            this.mObj.toggleMove();}
    }
    
    this.mObj.update();
    this.mObj.detectCollision();
    this.mObj.boundryCheck(this.mCamera);
    this.mObj.debug();
    var rad = this.mObj.getObjectAt(this.mObj.kPri);
    var msg = "Num: " + this.kAmountOfPairs*2 + " Current: " + this.mObj.kPri + " Rad " + rad.getRigidBody().getBoundRadius();
    this.mMsg.setText(msg);
};

MyGame.prototype.setCanvasSize = function(pW, pH)
{
    document.getElementById("GLCanvas").width = (window.innerWidth*.65) * pW;
    document.getElementById("GLCanvas").height = window.innerHeight * pH;
};
