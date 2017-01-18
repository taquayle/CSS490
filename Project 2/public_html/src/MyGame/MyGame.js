
/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, Scene: false, BlueLevel: false, Camera: false, Renderable: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

var framesASecond = 60;
var redPerUpdate = -20 / (3 * framesASecond);
var whitePerUpdate = 360 / (5 * framesASecond);

function MyGame() {
     // audio clips: supports both mp3 and wav formats
   //this.kBgClip = "assets/sounds/BGClip.mp3";
    //this.kCue = "assets/sounds/MyGame_cue.wav";

    // scene file name
    this.kSceneFile = "assets/scene.json";
    this.smallDC = "smallDC";
    // The camera to view the scene
    this.mCamera = null;
    this.smallCamera = null;
    this.mSqSet = [];
    // the hero and the support objects
    this.mHero = null;
    this.mSupport = null;
    

}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.loadScene = function () {
    gEngine.TextFileLoader.loadTextFile(this.kSceneFile, 
                                gEngine.TextFileLoader.eTextFileType.eJSONFile);
    
    gEngine.ResourceMap.loadDC(this.smallDC);
   // loads the audios
//    gEngine.AudioClips.loadAudio(this.kBgClip);
//    gEngine.AudioClips.loadAudio(this.kCue);
};


MyGame.prototype.unloadScene = function() {
/**********************************AUDIO***************************************/
    // Step A: Game loop not running, unload all assets
    // stop the background audio
    //gEngine.AudioClips.stopBackgroundAudio();

    // unload the scene resources
    // gEngine.AudioClips.unloadAudio(this.kBgClip);
    //      You know this clip will be used elsewhere in the game
    //      So you decide to not unload this clip!!
    //gEngine.AudioClips.unloadAudio(this.kCue);
/**********************************END*****************************************/
    gEngine.TextFileLoader.unloadTextFile(this.kSceneFile);
    gEngine.ResourceMap.loadDC(this.smallDC, this.smallCamera.getViewport());
    var nextLevel = new BlueLevel();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
};

//MyGame.prototype.draw = function () {
///**********************************AUDIO***************************************/
//   // Step A: Game loop not running, unload all assets
//    // stop the background audio
//    //gEngine.AudioClips.stopBackgroundAudio();
//
//    // unload the scene resources
//    // gEngine.AudioClips.unloadAudio(this.kBgClip);
//    //      The above line is commented out on purpose because
//    //      you know this clip will be used elsewhere in the game
//    //      So you decide to not unload this clip!!
//    //gEngine.AudioClips.unloadAudio(this.kCue);
///**********************************END*****************************************/
//    // Step B: starts the next level
//    // starts the next level
//    var nextLevel = new BlueLevel();  // next level to be loaded
//    gEngine.Core.startScene(nextLevel);
//};

MyGame.prototype.initialize = function () {
    //var sceneParser = new SceneFileParser(this.kSceneFile);
    var jsonString = gEngine.ResourceMap.retrieveAsset(this.kSceneFile);
    var sceneInfo = JSON.parse(jsonString);
    var sDC = gEngine.ResourceMap.retrieveAsset(this.smallDC);
    this.mCamera = new Camera(sceneInfo.Camera.Center,
                                sceneInfo.Camera.Width,
                                sceneInfo.Camera.Viewport);
    this.mCamera.setBackgroundColor(sceneInfo.Camera.BgColor);

    this.smallCamera = new Camera(
        vec2.fromValues(20, 60),   // position of the camera
        20,                        // width of camera
        sDC         // viewport (orgX, orgY, width, height)
        );
    this.smallCamera.setBackgroundColor([0.27, 0.81, 0.83, 1]);
    
    var i;
    for(i = 0; i < 6; i++)
    {
        var temp = new Renderable(gEngine.DefaultResources.getConstColorShader());
        temp.setColor(sceneInfo.Square[i].Color);
        temp.getXform().setPosition(sceneInfo.Square[i].Pos[0],
                                    sceneInfo.Square[i].Pos[1]);
        temp.getXform().setSize(sceneInfo.Square[i].Width, 
                                sceneInfo.Square[i].Height);
        temp.getXform().setRotationInDegree(sceneInfo.Square[i].Rotation);
        this.mSqSet.push(temp);

    }         
    


/**********************************AUDIO***************************************/
    // now start the bg music ...
    //gEngine.AudioClips.playBackgroundAudio(this.kBgClip);
/**********************************END*****************************************/
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCamera.setupViewProjection();
    
    //Step  C: draw all the squares
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
MyGame.prototype.update = function () {
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
        this.temp = 0;
    }
    this.temp++;
    redSq.incXPosBy(redPerUpdate);
};