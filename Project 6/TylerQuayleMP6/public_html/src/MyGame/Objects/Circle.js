/* File: Circle.js 
 *
 * Creates and initializes the Circle (Cir)
 * overrides the update function of GameObject to define
 * simple Cir behavior
 */

/*jslint node: true, vars: true */
/*global vec2, gEngine: false, GameObject: false, RigidCircleRenderable, LineRenderable,SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
//Circle.kMoveDelta = 20;
//Circle.kRotateDelta = 0.01;
//Circle.kRotateLimit = 1.0; // Rad


function Circle() {
    /**************************************************************************/
    // VARIABLES
    this.kDelta = Circle.kMoveDelta;
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
    
    this.mCir = new LineRenderable();
    this.mCir.getXform().setPosition(35, 20);
    this.mCir.getXform().setSize(9, 12);
    GameObject.call(this, this.mCir);
    
    var r = new RigidCircle(this.getXform(), Circle.kBoundSize);
    var vx = Circle.kMoveRandomDelta * (Math.random());
    var vy = Circle.kMoveRandomDelta * (Math.random());
    this.kVel = [vx, vy];
    r.setVelocity(0, 0);
    
    this.getXform().setRotationInRad((Math.random()-0.5 * Circle.kRotateLimit));
    
    this.setRigidBody(r);
}
gEngine.Core.inheritPrototype(Circle, GameObject);

Circle.prototype.draw = function(mCam){
    this.getRigidBody().draw(mCam);
    if(this.kColLines.length > 0)
        for(var i = 0; i < this.kColLines.length; i++){
            this.kColLines[i].draw(mCam);
            this.kColPoint[i].draw(mCam);}
};

Circle.prototype.update = function () {
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
Circle.prototype.reboundWalls = function(status)
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
Circle.prototype.toggleVelocity = function()
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
Circle.prototype.control = function(){this.kControl = true;
    this.getRigidBody().setColor(0,1,0);};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Circle.prototype.unControl = function(){this.kControl = false;
    this.getRigidBody().setColor(1,1,1);};


/******************************************************************************/
// Toggles and get methods. Used to get information or set statuses
/******************************************************************************/
Circle.prototype.isCollided = function(){this.kCollide = true;};
Circle.prototype.notCollided = function(){this.kCollide = false; };
Circle.prototype.getPosition = function() {return this.mCir.getXform().getPosition();};
Circle.prototype.getID = function() {return this.kID;};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Circle.prototype.updateLineRecords = function(count)
{
    this.kColLineCount = count;
    this.kColLines = [];
    this.kColPoint = [];
    for(var i = 0; i < count; i++){
        this.kColLines.push(new LineRenderable());
        this.kColLines[i].setShowLine(false);
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
Circle.prototype.getColInfo = function(i)
{
    var xf = this.mCir.getXform();
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
Circle.prototype.addLine = function(other)
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
Circle.prototype.clearLine = function(other)
{
    this.kColLines[other.getID()].setShowLine(false);
    this.kColPoint[other.getID()].setDrawVertices(false);
};

/******************************************************************************/
// Returns the total collisions from the list, by looking at each LineRenderable 
// to see if it's currently being shown, if it is, add 1 else skip it. One thing
// to note is that the ID corresponding to itself is always false.
/******************************************************************************/
Circle.prototype.totalCollisions = function()
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
Circle.prototype.getLineStatusAt = function(i)
{
    return this.kColLines[i].getShowLine();
};
