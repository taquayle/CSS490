/* File: Rectangle.js 
 *
 * Creates and initializes the Rectangle (Cir)
 * overrides the update function of GameObject to define
 * simple Cir behavior
 */

/*jslint node: true, vars: true */
/*global vec2, gEngine: false, GameObject: false, RigidRectangleRenderable, LineRenderable,SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
//Rectangle.kMoveDelta = 20;
//Rectangle.kRotateDelta = 0.01;
//Rectangle.kRotateLimit = 1.0; // Rad


function Rectangle() {
    /**************************************************************************/
    // VARIABLES
    this.kDelta = Rectangle.kMoveDelta;
    this.kTemp = null;
    /**************************************************************************/
    // COLLISION LINE VARIABLES
    this.kColLines = [];
    this.kColPoint = [];
    this.kColLineCount = 0;
    this.kID = 0;
    /**************************************************************************/
    // TOGGLES
    this.kControl = false;
    this.kCollide = false;
    
    this.mRec = new LineRenderable();
    this.mRec.getXform().setPosition(35, 20);
    this.mRec.getXform().setSize(9, 12);
    GameObject.call(this, this.mRec);
    
    var r = new RigidRectangle(this.getXform(), 9,12);
//    var vx = Rectangle.kMoveDelta * (Math.random() - .5);
//    var vy = Rectangle.kMoveDelta * (Math.random() - .5);
//    this.kVel = [vx, vy];
    r.setVelocity(0, 0);
    
    //this.getXform().setRotationInRad((Math.random()-0.5 * Rectangle.kRotateLimit));
    
    this.setRigidBody(r);
}
gEngine.Core.inheritPrototype(Rectangle, GameObject);

Rectangle.prototype.draw = function(mCam){
    this.getRigidBody().draw(mCam);
//    if(this.kColLines.length > 0)
//        for(var i = 0; i < this.kColLines.length; i++){
//            this.kColLines[i].draw(mCam);
//            this.kColPoint[i].draw(mCam);}
};

Rectangle.prototype.update = function () {
    GameObject.prototype.update.call(this);
    // control by WASD
    if(this.kControl)
    {
        var xform = this.getXform();
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) {
            xform.incYPosBy(this.kDelta);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) {
            xform.incYPosBy(-this.kDelta);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) {
            xform.incXPosBy(-this.kDelta);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
            xform.incXPosBy(this.kDelta);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)) {
            xform.incRotationByDegree(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.X)) {
            xform.incRotationByDegree(-1);}
    }
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Rectangle.prototype.reboundWalls = function(status)
{    
    if(status === 1 || status === 2){       // LEFT-RIGHT COLLISION
        this.getRigidBody().flipXVelocity();}
    else if(status === 4 || status === 8){  // TOP-BOTTOM COLLISION
        this.getRigidBody().flipYVelocity();}
    else{                                    // CORNER COLLISION
        this.getRigidBody().flipVelocity();}
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Rectangle.prototype.toggleVelocity = function()
{
    var r = this.getRigidBody().getVelocity();
    if(r[0] === 0 && r[1] === 0)
        this.getRigidBody().setVelocity(this.kVel[0], this.kVel[1]);
    else
        this.getRigidBody().setVelocity(0, 0);
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Rectangle.prototype.control = function(){this.kControl = true;
    this.getRigidBody().setColor(0,1,0);};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Rectangle.prototype.unControl = function(){this.kControl = false;
    this.getRigidBody().setColor(1,1,1);};


/******************************************************************************/
// Toggles and get methods. Used to get information or set statuses
/******************************************************************************/
Rectangle.prototype.isCollided = function(){this.kCollide = true;};
Rectangle.prototype.notCollided = function(){this.kCollide = false; };
Rectangle.prototype.getPosition = function() {return this.mRec.getXform().getPosition();};
Rectangle.prototype.getID = function() {return this.kID;};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Rectangle.prototype.updateLineRecords = function(count)
{
    this.kColLineCount = count;
    this.kColLines = [];
    this.kColPoint = [];
    for(var i = 0; i < count; i++){
        this.kColLines.push(new LineRenderable());
        this.kColPoint.push(new LineRenderable());
        this.kColPoint[i].setPointSize(5);}
        //this.kColLines[i].setColor(1,0,1);}
    this.kColLines[this.kID].setShowLine(false);
    this.kColLines[this.kID].setDrawVertices(false);
};

/******************************************************************************/
// Return the HTML code with the information about this circle. The code for 
// each row is configured in GameSetObject
/******************************************************************************/
Rectangle.prototype.getColInfo = function(i)
{
    var xf = this.mRec.getXform();
    var msg = "<td>"+ this.kID + "</td>";
    if(this.kCollide)
        msg += "<td bgcolor='#FF0000'>" + this.kCollide + "</td>";
    else
        msg += "<td bgcolor='#00FF00'>" + this.kCollide + "</td>";
    msg += "<td>(" + xf.getXPos().toPrecision(4)+ ", " + xf.getYPos().toPrecision(4) + ")</td>";
    msg += "<td>"+ this.getRigidBody().getBoundRadius().toFixed(3) + "</td>";
    msg += "<td>"+ this.totalCollisions() + "</td>";
    return msg;
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Rectangle.prototype.addLine = function(other)
{
    if(!other.getLineStatusAt(this.kID))
    {
        var sub = [0,0];
        var c1 = this.getPosition();
        var r1 = this.getRigidBody().getBoundRadius();
        var c2 = other.getPosition();
        var r2 = other.getRigidBody().getBoundRadius();

        sub = vec2.sub(sub, c1, c2);
        var normalFrom2to1 = [sub[0] * -(r2/r1), sub[1]*-(r2/r1)];
        normalFrom2to1 = vec2.normalize(normalFrom2to1,  normalFrom2to1);
        var radiusC2 = [normalFrom2to1[0] * r2, normalFrom2to1[1]*r2];

        sub = vec2.sub(sub, c2, c1);
        var normalFrom1to2 = [sub[0] * (r1/r2), sub[1] * (r1/r2)];
        normalFrom1to2 = vec2.normalize(normalFrom1to2,  normalFrom1to2);
        var radiusC1 = [normalFrom1to2[0] * r1, normalFrom1to2[1]*r1];

        var x1 = (c2[0] - radiusC2[0]);
        var y1 = (c2[1] - radiusC2[1]);
        var x2 = (c1[0] + radiusC1[0]);
        var y2 = (c1[1] + radiusC1[1]);

        this.kColLines[other.getID()].setVertices(x1, y1, x2, y2);
        this.kColLines[other.getID()].setShowLine(true);
        this.kColPoint[other.getID()].setVertices(x2, y2, x2, y2);
        this.kColPoint[other.getID()].setDrawVertices(true);
    }
};

/******************************************************************************/
// Clear the line corresponding with the ID of the other circle.
/******************************************************************************/
Rectangle.prototype.clearLine = function(other)
{
    this.kColLines[other.getID()].setShowLine(false);
    this.kColPoint[other.getID()].setDrawVertices(false);
};

/******************************************************************************/
// Returns the total collisions from the list, by looking at each LineRenderable 
// to see if it's currently being shown, if it is, add 1 else skip it. One thing
// to note is that the ID corresponding to itself is always false.
/******************************************************************************/
Rectangle.prototype.totalCollisions = function()
{
    var temp = 0;
    for(var i = 0; i < this.kColLineCount; i++)
    {
        if(this.kColLines[i].getShowLine())
            temp++;
    }
    return temp;
};

/******************************************************************************/
// Clear the line corresponding with the ID of the other circle.
/******************************************************************************/
Rectangle.prototype.getLineStatusAt = function(i)
{
    return this.kColLines[i].getShowLine();
};
