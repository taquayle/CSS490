/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, SimpleShader: false, Renderable: false, Camera: false, mat4: false, vec3: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!


function MyGame(htmlCanvasID) {
    // variables of the constant color shader
    this.mConstColorShader = null;
    
    // variables for the squares
    this.mRedSq = null;
    // The camera to view the scene
    this.mCamera = null;
    
    // Initialize the webGL Context
    gEngine.Core.initializeEngineCore(htmlCanvasID);


    this.squares = [];  // Array to hold all the square objects
    this.borders = [-30, 70, 97, 22.5]; // L-R-T-B Borders.
    // Initialize the game
    this.initialize();
}

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(20, 60),   // position of the camera
        100,                       // width of camera
        [0, 0, 640, 480]         // viewport (orgX, orgY, width, height)
        );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
        // sets the background to gray

    // Step  B: create the shader
    this.mConstColorShader = new SimpleShader(
        "src/GLSLShaders/SimpleVS.glsl",      // Path to the VertexShader 
        "src/GLSLShaders/SimpleFS.glsl");    // Path to the Simple FragmentShader    

    // Step  C: Create the Renderable objects:
    this.mRedSq = new Renderable(this.mConstColorShader);
    this.mRedSq.setColor([1, 0, 0, 1]);


    // Step  E: Initialize the red Renderable object: centered 2x2
    this.mRedSq.getXform().setPosition(20, 60);
    this.mRedSq.getXform().setSize(1, 1);
    
    

    // Step F: Start the game loop running
    gEngine.GameLoop.start(this);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray

    // Step  B: Activate the drawing Camera
    this.mCamera.setupViewProjection();
    
    var i;
    for(i in this.squares)
    {
        this.squares[i].draw(this.mCamera.getVPMatrix());
    }
    
    // Step  D: Activate the red shader to draw
    this.mRedSq.draw(this.mCamera.getVPMatrix());
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    // For this very simple game, let's move the red
    var redXform = this.mRedSq.getXform();
    var deltaX = 0.5;
   
    var elm = document.getElementById("UpdateFrame");

    elm.innerHTML =

        "<b>Red Pos: </b>" + redXform.getPosition() + 
        "<br><b>Len: </b>" + this.squares.length;

    // Step A: test for white square movement
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
        if (redXform.getXPos() > this.borders[1]) // right-bound of the window
            redXform.setPosition(this.borders[0], redXform.getYPos());
        redXform.incXPosBy(deltaX);
    }
        // Step A: test for white square movement
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        if (redXform.getXPos() < this.borders[0]) // left-bound of the window
            redXform.setPosition(this.borders[1], redXform.getYPos());
        redXform.incXPosBy(-deltaX);
        
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        if (redXform.getYPos() > this.borders[2]) // up-bound of the window
            redXform.setPosition(redXform.getXPos(), this.borders[3]);
        redXform.incYPosBy(deltaX);
    }


    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        if (redXform.getYPos() < this.borders[3]) // bottom-bound of the window
            redXform.setPosition(redXform.getXPos(), this.borders[2]);
        redXform.incYPosBy(-deltaX);
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
        var sqNum = Math.floor(10 * Math.random()) + 10;
        var i = 0;
        while(i < sqNum)
        {
            // Create new renderable
            var temp = new Renderable(this.mConstColorShader);
            // Set new random color
            temp.setColor([Math.random(), Math.random(), Math.random(), 1]);
            
            // Create random coordinates within 5 units, X and Y
            var xShift = 5 * Math.random();
            var yShift = 5 * Math.random();
            
            // Let coordinates be between -5 and 5
            xShift *= Math.floor(Math.random()*2) === 1 ? 1 : -1; 
            yShift *= Math.floor(Math.random()*2) === 1 ? 1 : -1; 
            
            // Set position for temp renderable
            temp.getXform().setPosition((redXform.getXPos() + xShift), 
                                        (redXform.getYPos() + yShift));
            
            // create a new size for temp, 1-6 units in size
            var rSize = (5 * Math.random()) + 1;
            temp.getXform().setSize(rSize, rSize);
            
            // Rotate temps by 0 - 360 degs (1 - 2 rads)
            temp.getXform().setRotationInRad(Math.random() * 2);
            
            // Push newest temp onto stack
            this.squares.push(temp);  
            i++;
        }
    }
};
