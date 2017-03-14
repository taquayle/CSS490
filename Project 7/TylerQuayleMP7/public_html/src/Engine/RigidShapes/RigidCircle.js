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
    this.mType = "RigidCircle";
    this.mSides = new LineRenderable();
    this.mRadius = r;
    this.updateInertia();
}
gEngine.Core.inheritPrototype(RigidCircle, RigidShape);

RigidCircle.prototype.rigidType = function () {
    return RigidShape.eRigidType.eRigidCircle;
};
RigidCircle.prototype.getRadius = function () {
    return this.mRadius;
};

RigidCircle.prototype.draw = function (aCamera) {
    if (!this.mDrawBounds) {
        return;
    }
    RigidShape.prototype.draw.call(this, aCamera);
    
    // kNumSides forms the circle.
    var pos = this.getPosition();
    var prevPoint = vec2.clone(pos);
    var deltaTheta = (Math.PI * 2.0) / this.kNumSides;
    var theta = deltaTheta;
    prevPoint[0] += this.mRadius;
    var i, x, y;
    x = pos[0] + this.mRadius * Math.cos(theta);
    y = pos[1] +  this.mRadius * Math.sin(theta);
    this.mSides.setFirstVertex(pos[0], pos[1]);
    this.mSides.setSecondVertex(x, y);
    this.mSides.draw(aCamera);
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
};

RigidCircle.prototype.setColor = function (color) {
    RigidShape.prototype.setColor.call(this, color);
    this.mSides.setColor(color);
};

//rotate angle in counterclockwise
RigidCircle.prototype.rotate = function (angle) {
    this.mAngle += angle;
    var mCenter = this.getPosition();
    this.mXform.setRotationInRad(this.mAngle);
    var r = this.mXform.getRotationInRad();
    //this.mStartpoint = this.mStartpoint.rotate(this.mCenter, angle);
    vec2.rotateWRT(mCenter, mCenter, r, mCenter);
    return this;
};

RigidCircle.prototype.move = function (s) {
    var pos = this.getPosition();
    vec2.add(pos, pos, s);
    return this;
};

RigidCircle.prototype.updateInertia = function () {
    if (this.mInvMass === 0) {
        this.mInertia = 0;
    } else {
        // this.mInvMass is inverted!!
        // Inertia=mass * radius^2
        // 12 is a constant value that can be changed
        this.mInertia = (1 / this.mInvMass) * (this.mRadius * this.mRadius) / 12;
    }
};

RigidCircle.prototype.update = function () {

    RigidShape.prototype.update.call(this);
};
