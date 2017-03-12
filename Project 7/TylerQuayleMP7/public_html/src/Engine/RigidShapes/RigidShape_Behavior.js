/* 
 * File: RigidShape_Physics.js
 * Support physical attributes for RigidShape
 */

/*jslint node: true, vars:true, white: true*/
/*global gEngine, vec2, RigidShape */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";

RigidShape.prototype.update = function () {
    var dt = gEngine.GameLoop.getUpdateIntervalInSeconds();
    
    //v += a*t
    var accelScale = [0,0];
    var acc = this.getAcceleration();
    vec2.scale(accelScale, acc, dt);
    vec2.add(this.mVelocity, this.mVelocity, accelScale);
    //    s += v*t 
    var velScale = [0,0];
    vec2.scale(velScale, this.mVelocity, dt);
    
    this.move(velScale);

    this.mAngularVelocity += this.mAngularAcceleration * dt;    
    this.rotate(this.mAngularVelocity * dt);    
};



RigidShape.prototype.getInvMass = function () { return this.mInvMass; };
RigidShape.prototype.setMass = function (m) {
    if(m > 0) {
        this.mInvMass = 1/m;
    } else {
        this.mInvMass = 0;
    }
};
RigidShape.prototype.getVelocity = function () { return this.mVelocity; };
RigidShape.prototype.setVelocity = function (v) { this.mVelocity = v; };
RigidShape.prototype.getRestitution = function () { return this.mRestitution; };
RigidShape.prototype.setRestitution = function (r) { this.mRestitution = r; };
RigidShape.prototype.getFriction = function () { return this.mFriction; };
RigidShape.prototype.setFriction = function (f) { this.mFriction = f; };
RigidShape.prototype.getAcceleration = function () { return this.mAcceleration; };
RigidShape.prototype.setAcceleration = function (g) { this.mAcceleration = g; };

RigidShape.prototype.getInertia = function(){return this.mInertia;};
RigidShape.prototype.getAngle = function(){return this.mAngle;};
RigidShape.prototype.getAngularVelocity = function(){return this.mAngularVelocity;};