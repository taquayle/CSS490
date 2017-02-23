/* 
 * File: RigidCircle.js
 * Defines a rigid circle
 */

/*jslint node: true, vars:true , white: true*/
/*global gEngine, RigidShape, vec2, LineRenderable */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";

function RigidCircle(xform, r) {
    RigidShape.call(this, xform);
    
    this.kNumSides = 16;
    this.mSides = new LineRenderable();
    this.kColor = [1,1,1];
    this.mRadius = r;
    this.mAngle = 0;
}
gEngine.Core.inheritPrototype(RigidCircle, RigidShape);

RigidCircle.prototype.rigidType = function () {
    return RigidShape.eRigidType.eRigidCircle;
};
RigidCircle.prototype.getRadius = function () {
    return this.mRadius;
};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
RigidCircle.prototype.changeRadius = function (input) {
    this.mRadius += (.1 * input);
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
RigidCircle.prototype.findRad = function(sX, sY)
{
    var lX = (sX/2);
    var lY = (sY/2);
    this.mRadius = Math.sqrt(((lX * lX)+(lY * lY)));
};
RigidCircle.prototype.draw = function (aCamera) {
    if (!this.mDrawBounds) {
        return;
    }
    RigidShape.prototype.draw.call(this, aCamera);
    var pos = this.getPosition();
    var prevPoint = vec2.clone(pos);
    var deltaTheta = (Math.PI * 2.0) / this.kNumSides;
    var theta = deltaTheta;
    prevPoint[0] += this.mRadius;
    var i, x, y;
    for (i = 1; i <= this.kNumSides; i++) {
        x = pos[0] + this.mRadius * Math.cos(theta);
        y = pos[1] +  this.mRadius * Math.sin(theta);
        
        this.mSides.setFirstVertex(prevPoint[0], prevPoint[1]);
        this.mSides.setSecondVertex(x, y);
        this.mSides.draw(aCamera);
        
        theta = theta + deltaTheta;
        prevPoint[0] = x;
        prevPoint[1] = y;
    }
    /**************************************************************************/
    // FRONT DIR
    this.mSides.setFirstVertex(pos[0], pos[1]);
    x = pos[0] +  (this.mRadius * Math.cos(this.mAngle));
    y = pos[1] +  (this.mRadius * Math.sin(this.mAngle));
    this.mSides.setSecondVertex(x, y);
    this.mSides.draw(aCamera);
    
    /**************************************************************************/
    // Compass
    var cSize = this.mRadius/2;
    var xDir = [1,0,-1,0];
    var yDir = [0,1,0,-1];
    for(var i = 0; i < xDir.length; i++)
    {
        x = pos[0] + (cSize * xDir[i]);
        y = pos[1] + (cSize * yDir[i]);
        this.mSides.setFirstVertex(pos[0], pos[1]);
        this.mSides.setSecondVertex(x, y);
        this.mSides.draw(aCamera);
    }

};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
RigidCircle.prototype.setColor = function (r,g,b) {
    RigidShape.prototype.setColor.call(this, [r,g,b,1]);
    this.mSides.setColor(r,g,b);
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
RigidCircle.prototype.setAngle = function(ang)
{
    this.mAngle = Math.atan2(ang[1], ang[0]);
};

