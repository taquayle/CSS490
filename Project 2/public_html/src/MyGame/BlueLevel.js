/*
 * File: BlueLevel.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, BlueLevel: false, Camera: false, Renderable: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
var framesASecond = 60;
var redPerUpdate = -20 / (3 * framesASecond);
var whitePerUpdate = 360 / (5 * framesASecond);

function BlueLevel() {
    // audio clips: supports both mp3 and wav formats
//    this.kBgClip = "assets/sounds/BGClip.mp3";
//    this.kCue = "assets/sounds/BlueLevel_cue.wav";

    // scene file name
    this.kSceneFile = "assets/BlueLevel.xml";
    this.smallDC = "smallDC";
    // all squares
    this.mSqSet = [];        // these are the Renderable objects

    // The camera to view the scene
    this.mCamera = null;
    this.smallCamera = null;
    var temp;
}
gEngine.Core.inheritPrototype(BlueLevel, Scene);

BlueLevel.prototype.loadScene = function () {
    // load the scene file
    gEngine.TextFileLoader.loadTextFile(this.kSceneFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
    gEngine.ResourceMap.loadDC(this.smallDC);
    // loads the audios
//    gEngine.AudioClips.loadAudio(this.kBgClip);
//    gEngine.AudioClips.loadAudio(this.kCue);
};

BlueLevel.prototype.unloadScene = function () {
    // stop the background audio
    //gEngine.AudioClips.stopBackgroundAudio();

    // unload the scene flie and loaded resources
    gEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
    gEngine.ResourceMap.loadDC(this.smallDC, this.smallCamera.getViewport());
    var nextLevel = new MyGame();  // load the next level
    gEngine.Core.startScene(nextLevel);
};

BlueLevel.prototype.initialize = function () {
    var sceneParser = new SceneFileParser(this.kSceneFile);
    var sDC = gEngine.ResourceMap.retrieveAsset(this.smallDC);
    this.temp = 0;
    // Step A: Read in the camera
    this.mCamera = sceneParser.parseCamera();
    this.smallCamera = new Camera(
        vec2.fromValues(20, 60),   // position of the camera
        20,                        // width of camera
        sDC        // viewport (orgX, orgY, width, height)
        );
    this.smallCamera.setBackgroundColor([0.27, 0.81, 0.83, 1]);    
    // Step B: Read all the squares
    sceneParser.parseSquares(this.mSqSet);

    // now start the bg music ...
    //gEngine.AudioClips.playBackgroundAudio(this.kBgClip);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
BlueLevel.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCamera.setupViewProjection();
    

    // Step  C: draw all the squares
    var i;
    for (i = 0; i < this.mSqSet.length; i++) {
        this.mSqSet[i].draw(this.mCamera.getVPMatrix());
    }
    
    this.smallCamera.setupViewProjection();
    for (i = 0; i < this.mSqSet.length; i++) {
        this.mSqSet[i].draw(this.smallCamera.getVPMatrix());
    }
};

// The update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
BlueLevel.prototype.update = function () {
    // For this very simple game, let's move the first square
    var whiteSq = this.mSqSet[0].getXform();
    var redSq = this.mSqSet[1].getXform();
    var edges = [this.mSqSet[2].getXform(),
                 this.mSqSet[3].getXform(),
                 this.mSqSet[4].getXform(),
                 this.mSqSet[5].getXform()];
    var delta = 0.05;
    var cDelta = 5.5;
    
    
    var vp = this.smallCamera.getViewport();
    this.smallCamera.setWCWidth(edges[1].getXPos()-edges[0].getXPos());
    this.smallCamera.setWCCenter((edges[1].getXPos()+edges[0].getXPos())/2,
                                 (edges[1].getYPos()+edges[2].getYPos())/2);
    
   
    checkSmallCamera(vp, cDelta);
    checkEdges(edges, delta);

    whiteSq.incRotationByDegree(whitePerUpdate);
    
    if(redSq.getXPos() < 10)
    {
        redSq.setXPos(30);
    }
    redSq.incXPosBy(redPerUpdate);
};


var checkSmallCamera = function(vp, cDelta)
{
     // Support hero movements
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.W)) {
        //gEngine.AudioClips.playACue(this.kCue);
        vp[1] += cDelta;
        this.smallCamera.setViewport(vp);
    }
    if (gEngine.Input.isKeyReleased(gEngine.Input.keys.A)) {
        //gEngine.AudioClips.playACue(this.kCue);
        vp[0] -= cDelta;
        this.smallCamera.setViewport(vp);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.S)) {
        //gEngine.AudioClips.playACue(this.kCue);
        vp[1] -= cDelta;
        this.smallCamera.setViewport(vp);
    }

    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.D)) {
        //gEngine.AudioClips.playACue(this.kCue);
        vp[0] += cDelta;
        this.smallCamera.setViewport(vp);
    }
};

var checkEdges = function(edges, delta)
{
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.F)) {

        moveEdges(edges, 0, delta);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.C)) {

        moveEdges(edges, -delta, 0);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.V)) {

        moveEdges(edges, 0, -delta);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.B)) {

        moveEdges(edges, delta, 0);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)) {

        zoomEdges(edges, delta, delta);
        
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.X)) {

        zoomEdges(edges, -delta, -delta);
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        gEngine.GameLoop.stop();
    }
};

var zoomEdges = function(edges, deltaX, deltaY){
    
    edges[0].incXPosBy(deltaX * 2);
    edges[0].incYPosBy(-deltaY);

    edges[1].incXPosBy(-deltaX * 2);
    edges[1].incYPosBy(-deltaY);

    edges[2].incXPosBy(deltaX * 2);
    edges[2].incYPosBy(deltaY);

    edges[3].incXPosBy(-deltaX * 2);
    edges[3].incYPosBy(deltaY);
    
    
};

var moveEdges = function(edges, deltaX, deltaY){
    edges[0].incXPosBy(deltaX);
    edges[0].incYPosBy(deltaY);

    edges[1].incXPosBy(deltaX);
    edges[1].incYPosBy(deltaY);

    edges[2].incXPosBy(deltaX);
    edges[2].incYPosBy(deltaY);

    edges[3].incXPosBy(deltaX);
    edges[3].incYPosBy(deltaY);
};