/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */
/*jslint node: true, vars: true */
/*global gEngine: false, SimpleShader: false, Renderable: false, Camera: false, mat4: false, vec3: false, vec2: false */


"use strict";  // Operate in Strict mode such that variables must be declared before used!
/******************************************************************************/
//  Modified by: Tyler Quayle
/******************************************************************************/

function MyGame(htmlCanvasID) {
    // variables of the constant color shader
    this.mConstColorShader = null;
    
    // variables for the squares
    this.mRedSq = null;
    // The camera to view the scene
    this.mCamera = null;
    
    // Initialize the webGL Context
    gEngine.Core.initializeEngineCore(htmlCanvasID);


    this.creSquares = [];   // Array to hold all the square objects
    this.delSquares = [];   // Array to hold the deletion queue
    
    this.creTimeStamp = []; // Array to hold the timestamp of each group
    this.delTimeStamp = []; // Array to hold the deletion time intervals
    
    this.creSqNums = [];    // Array to hold how many squares per group
    this.delSqNums = [];    // Array to hold how many squares to delete
    
    this.delTime;           // Current timestamp when deletion started
    this.creTime;           // Current timestamp since first creation.
    
    this.borders = [-30, 70, 97, 22.5]; // L-R-T-B Borders.
    
    this.delMode = false;
    this.firstCreate = true;
    this.rW = false;
    
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
    
    this.creTime = 0;
    this.displayArray();
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
    gUpdateObject((this.delSquares.length + this.creSquares.length), 
                    this.delMode, this.rW);
    
    for(i in this.delSquares)
    {
        this.delSquares[i].draw(this.mCamera.getVPMatrix());
    }
    for(i in this.creSquares)
    {
        this.creSquares[i].draw(this.mCamera.getVPMatrix());
    }
    
    this.displayArray();
    // Step  D: Activate the red shader to draw
    this.mRedSq.draw(this.mCamera.getVPMatrix());
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {
    // For this very simple game, let's move the red
    var redXform = this.mRedSq.getXform();
    var deltaX = 0.5;
    
    /* CHECK FOR DELETE MODE*/
    if(this.delMode)
    {
        this.deleteArray();
    }
    
    /* CHECK FOR RIGHT MOVEMENT */
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Right)) {
        if (redXform.getXPos() > this.borders[1]) // right-bound of the window
            redXform.setPosition(this.borders[0], redXform.getYPos());
        redXform.incXPosBy(deltaX);
    }
    
    /*  CHECK FOR LEFT MOVEMENT */
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Left)) {
        if (redXform.getXPos() < this.borders[0]) // left-bound of the window
            redXform.setPosition(this.borders[1], redXform.getYPos());
        redXform.incXPosBy(-deltaX);
        
    }
    
    /*  CHECK FOR UP MOVEMENT */
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Up)) {
        if (redXform.getYPos() > this.borders[2]) // up-bound of the window
            redXform.setPosition(redXform.getXPos(), this.borders[3]);
        redXform.incYPosBy(deltaX);
    }

    /* CHECK FOR DOWN MOVEMENT */
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Down)) {
        if (redXform.getYPos() < this.borders[3]) // bottom-bound of the window
            redXform.setPosition(redXform.getXPos(), this.borders[2]);
        redXform.incYPosBy(-deltaX);
    }
    
    /* CHECK FOR SPACEBAR */
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
        var sqNum = Math.floor(10 * Math.random()) + 10;
        var i = 0;
        while(i < sqNum)
        {
            this.createSquare(redXform);
            
            i++;
        }
        
        if(this.firstCreate) //If this is the first item to be created
        {
            this.creTimeStamp.push(0);
            this.creTime = Date.now();
            this.firstCreate = false;
        }
        else
        {
            this.creTimeStamp.splice(this.creTimeStamp.length-1, 0, 
                                    (Date.now() - this.creTime));
            this.creTime = Date.now();
        }
        this.creSqNums.push(sqNum); 
    }
    
    /*  CHECK FOR 'D' KEY FOR DELETE  */
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.D)) 
    {
       if(this.creSquares.length >= 1)
       {
           this.delMode = true;

           this.copyArrays();

           this.firstCreate = true; // reset first create
           this.singleDelete();
       }
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.W)) 
    {
        this.W(redXform);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.S)) 
    {
        this.rW = !this.rW;
    }
};

MyGame.prototype.W = function(redXform)
{
    var scale_U = 1;
    var scale_W = 3;
    var U = [0,1,2,3,4,5, -1,-2,-3,-4, 6,7,8,9,10,  -5,-6,-7,-8,-9,-10];
    var W = [5,4,3,2,1,0,  4, 3, 2, 1, 1,2,3,4, 5,   0, 1, 2, 3, 4, 5];

    for(var i in W)
    {
        U[i] *= scale_U;
        W[i] *= scale_W;
        // Create new renderable
        var temp = new Renderable(this.mConstColorShader);
      
        if(this.rW) // Random squares for W
        {
            var rSize = (5 * Math.random()) + 1;
            temp.getXform().setSize(rSize, rSize);
            temp.setColor([Math.random(), Math.random(), Math.random(), 1]);
        }
        else // Huskey Purple for squares
        {
            temp.getXform().setSize(3, 3);
            temp.setColor([.2, 0, .43, 1]);
        }
        
        // Set position for temp renderable
        temp.getXform().setPosition((redXform.getXPos() + U[i]), (redXform.getYPos()+W[i]));

        // Rotate temps by 0 - 360 degs (1 - 2 rads)
        temp.getXform().setRotationInRad(Math.random() * 2);

        // Push newest temp onto stack
        this.creSquares.push(temp);
    }
    
    if(this.firstCreate) //If this is the first item to be created
    {
        this.creTimeStamp.push(0);
        this.creTime = Date.now();
        this.firstCreate = false;
    }
    else
    {
        this.creTimeStamp.splice(this.creTimeStamp.length-1, 0, 
                                (Date.now() - this.creTime));
        this.creTime = Date.now();
    }
    this.creSqNums.push(W.length); 
};
/******************************************************************************/
// copyArrays
//  copy all of the creation arrays (denoted by cre) into the deletion arrays
//  (denoted by del).
/******************************************************************************/
MyGame.prototype.copyArrays = function()
{
    /* COPY SQUARES TO DELETE SQUARES*/
    this.delSquares.push.apply(this.delSquares, this.creSquares);
    this.creSquares = []; // CLEAR SQUARES

    /* COPY TIMES STAMPES TO DELETE TIMESTAMPS*/
    this.delTimeStamp.push.apply(this.delTimeStamp, this.creTimeStamp);
    this.creTimeStamp =  []; // CLEAR TIMESTAMPS

    /* COPY SQUARE NUMBERS TO DELETE SQUARENUMBERS*/
    this.delSqNums.push.apply(this.delSqNums, this.creSqNums);
    this.creSqNums = []; // CLEAR SQUARE NUMBERS
};

/******************************************************************************/
// createSquare(redXform)
//  given redXform, create new square with random tilt/color/size at an distance
//  from redXform location.
/******************************************************************************/
MyGame.prototype.createSquare = function(redXform)
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
    this.creSquares.push(temp);
};

/******************************************************************************/
// displayArray()
//  display the contents of each array.
/******************************************************************************/
MyGame.prototype.displayArray = function()
{
    /* CREATE TABLE FOR CURRENT ARRAY */
    var html = "<table style='float: left' border='1'>";
    /* TABLE TITLE */
    html+="<tr><th colspan='3'>CREATION ARRAY</th></tr>";
    /* TABLE HEADINGS */
    html+="<tr>";
    html+="<td>Index </td>";
    html+="<td>Number of Squares</td>";
    html+="<td>Time to Delete</td>";
    html+="</tr>";
    
    /* CREATE TABLE CONTENTS */
    for(var i in this.creSqNums)
    {
        html+="<tr><td>"+i+"</td>";
        html+="<td>"+this.creSqNums[i]+"</td>";
        html+="<td>"+this.creTimeStamp[i]+"</td></tr>";
    }
    html+="</table>"; // END CREATION TABLE
    
    /* CREATE TABLE FOR TIMER*/
    html += "<table style='float: left' border='1'>";
    /*  SHOW TIMER FOR DELETE MODE */
    if(this.delMode)
    {
        html += "<tr><th width='100'>DELETION</th></tr>";
        html += "<tr><td align='center'>" + (Date.now()-this.delTime);
    }
    /* SHOW TIMER FOR CREATION MODE */
    else if(this.firstCreate === false)
    {
        html += "<tr><th width='100'>CREATION</th></tr>";
        html += "<tr><td align='center'>" + (Date.now()-this.creTime);
    }
    
    /* WAITING FOR INPUT FOR DELETE/CREATE*/
    else
    {
        html += "<tr><th width='100'>WAITING.....</th></tr>";
        html += "<tr><td align='center'>" + 0;
    }
    html+="</td></tr></table>"; // END TIMER TABLE
    
    /* CREATE TABLE FOR DELETE QUEUE*/
    html += "<table style='float: left' border='1'>";
    /* TABLE TITLE */
    html+="<tr><th colspan='4'>DELETE QUEUE</th></tr>";
    /* TABLE HEADINGS */
    html+="<tr>";
    html+="<td>Index</td>";
    html+="<td>Number of Squares</td>";
    html+="<td>Interval Time</td>";
    html+="</tr>";
    
    /* CREATE TABLE CONTENTS*/
    if(this.delMode)
    {
        for(i=this.delSqNums.length-1; i>=0; i--)
        {
            html+="<td>" + i +"</td>";
            html+="<td>" + this.delSqNums[i] + "</td>";
            html+="<td>" + this.delTimeStamp[i] + "</td></tr>";
        }
    }
    html+="</table>"; // END DELETION ARRAY
    document.getElementById("Stats").innerHTML = html;
};

/******************************************************************************/
// deleteArray()
//  check if the current counter (Date.now()-this.dTime) is greater then the
//  next value in dTimeStamp. this will mimic the deletion to be in time with
//  creation intervals
/******************************************************************************/
MyGame.prototype.deleteArray = function ()
{
    if(this.delSquares.length <= 0)
    {
        this.delMode=false;
    }
    
    var timeDiff = this.delTimeStamp[this.delTimeStamp.length-1];

    if( (Date.now()-this.delTime) >= timeDiff)
    {
        this.singleDelete();
        
        
    }
};

/******************************************************************************/
// singleDelete()
//  delete the last entry from dSquares according to the size of sqNums. That is
//  delete the the amount of squares in dSquares equals to dsqNums last entry
//  reset dTime to count the correct intervals between deletions
/******************************************************************************/
MyGame.prototype.singleDelete = function()
{
    var end = this.delSquares.length - this.delSqNums[this.delSqNums.length-1];
    
    this.delSquares.splice(end, this.delSqNums[this.delSqNums.length-1]);
    this.delSqNums.splice(this.delSqNums.length-1, 1);
    this.delTimeStamp.splice(this.delTimeStamp.length-1, 1);
    this.delTime = Date.now();
};