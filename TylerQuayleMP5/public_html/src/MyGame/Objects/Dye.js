/*
 * File: Dye.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine: false, GameObject: false, ShakePosition,FontRenderable, Interpolate, PrintLine,
 * SpriteRenderable: false */

/* find out more about jslint: http://www.jslint.com/help.html */
function Dye(spriteTexture, kd) {
    this.kDelta = .05;
    this.mXMag = kd;
    this.mYMag = kd;
    this.kFree = true;
    this.kControl = true;
    
    this.mDye = new SpriteRenderable(spriteTexture);
    this.mDye.setColor([1, 1, 1, 0]);
    this.mDye.getXform().setPosition(0, 0);
    this.mDye.getXform().setSize(9, 12);
    this.mDye.setElementPixelPositions(0, 120, 0, 180);
    
    

    GameObject.call(this, this.mDye);
    var boundCircle = new RigidCircle(this.getXform(), 10);
    boundCircle.findRad(9,12);
    boundCircle.setColor([0, 1, 0, 1]);
    boundCircle.setAngle(this.getCurrentFrontDir());
    boundCircle.setDrawBounds(true);
    this.setPhysicsComponent(boundCircle);
    
    this.rigidRec = new RigidRectangle(this.getXform(), 9, 12);
    this.rigidRec.setDrawBounds(true);
}
gEngine.Core.inheritPrototype(Dye, GameObject);

Dye.prototype.draw = function(mCamera)
{
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
{ this.mDye.getXform().incXPosBy(dir*this.mXMag);};

Dye.prototype.moveY = function(dir)
{ this.mDye.getXform().incYPosBy(dir*this.mYMag);};

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
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Dye.prototype.notCollided = function()
{    
    this.kFree = true;
};

