/*
 * File: Dye.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine: false, GameObject: false, ShakePosition,FontRenderable, Interpolate, PrintLine,
 * SpriteRenderable: false */

/* find out more about jslint: http://www.jslint.com/help.html */
function Dye(spriteTexture, kd) {
    /**************************************************************************/
    // VARIABLES
    this.kDelta = .05;
    this.mXMag = kd;
    this.mYMag = kd;
    this.xDir = 1;
    this.yDir = 1;
    /**************************************************************************/
    // TOGGLES
    this.kFree = true;
    this.kControl = true;
    this.kTexture = true;
    
    /**************************************************************************/
    // SETUP DYE
    this.mDye = new SpriteRenderable(spriteTexture);
    this.mDye.setColor([1, 1, 1, 0]);
    this.mDye.getXform().setPosition(0, 0);
    this.mDye.getXform().setSize(9, 12);
    this.mDye.setElementPixelPositions(0, 120, 0, 180);

    GameObject.call(this, this.mDye);
    
    /**************************************************************************/
    // SETUP PHYSICS COMPONENT /  BOUNDCIRCLE
    var boundCircle = new RigidCircle(this.getXform(), 10);
    boundCircle.findRad(9,12);
    boundCircle.setColor([0, 1, 0, 1]);
    boundCircle.setAngle(this.getCurrentFrontDir());
    boundCircle.setDrawBounds(true);
    this.setPhysicsComponent(boundCircle);
    
    /**************************************************************************/
    // SETUP RIGIDREC
    this.rigidRec = new RigidRectangle(this.getXform(), 9, 12);
    this.rigidRec.setDrawBounds(true);
}
gEngine.Core.inheritPrototype(Dye, GameObject);

Dye.prototype.draw = function(mCamera)
{
    if(this.kTexture)
        this.mDye.draw(mCamera);
    this.getPhysicsComponent().draw(mCamera);
    this.rigidRec.draw(mCamera);
};

Dye.prototype.update = function () 
{
    if(this.kControl && this.kFree)
    {
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) {
            this.moveY(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) {
            this.moveX(-1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) {
            this.moveY(-1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
            this.moveX(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)) {
            this.rotate(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.X)) {
            this.rotate(-1);}
    }
};

Dye.prototype.moveX = function(dir)
{ this.mDye.getXform().incXPosBy(dir*this.mXMag*this.yDir);};

Dye.prototype.moveY = function(dir)
{ this.mDye.getXform().incYPosBy(dir*this.mYMag*this.xDir);};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Dye.prototype.rotate = function(dir)
{
    var xform = this.mDye.getXform();
    xform.incRotationByRad(dir * this.kDelta);
    var t = xform.getRotationInRad(); 
    var x = [Math.cos(t+1.57), Math.sin(t+1.57)];
    this.setCurrentFrontDir(x);
    this.getPhysicsComponent().setAngle(this.getCurrentFrontDir());
    this.rigidRec.setAngle(t);
};

Dye.prototype.control = function(){this.kControl = true;this.getPhysicsComponent().setColor(0,1,0);};
Dye.prototype.unControl = function(){this.kControl = false;this.getPhysicsComponent().setColor(1,1,1);};

Dye.prototype.toggleTexture = function(){this.kTexture = !this.kTexture;};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Dye.prototype.reboundWalls = function(status)
{    
    status = 1;
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Dye.prototype.isCollided = function()
{    
    this.kFree = false;
    this.xDir = -1;
    this.yDir = -1;
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Dye.prototype.notCollided = function()
{    
    this.kFree = true;
    this.xDir = 1;
    this.yDir = 1;
};

Dye.prototype.getInfo = function(i)
{
    var xf = this.mDye.getXform();
    var a = Math.abs((xf.getRotationInRad() % 6.28));
    var msg = "<td> Dye" + "</td>";
    msg += "<td>(" + xf.getXPos().toPrecision(2)+ ", " + xf.getYPos().toPrecision(2) + ")</td>";
    msg += "<td>" + a.toPrecision(3) + "</td>";
    msg += "<td>" + "</td>";
    msg += "<td>" + "</td>";
    msg += "<td>" +this.getPhysicsComponent().getRadius().toPrecision(3) + "</td>";
    return msg;
};

Dye.prototype.getDir = function()
{
    return [0,0];  
};

Dye.prototype.setDir = function(dir)
{
    
};

Dye.prototype.getRadius = function()
{
    return this.getPhysicsComponent().getRadius();
};