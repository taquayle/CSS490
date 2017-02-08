/*
 * File: DyePack.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DyePack(texture, atX, atY, kD) {
    this.mCycleLeft = 300;
    this.kDelta = kD;
    this.mDyePack = new SpriteRenderable(texture);
    this.mDyePack.setColor([1, 1, 1, 0]);
    this.mDyePack.getXform().setPosition(atX, atY);
    this.mDyePack.getXform().setSize(2, 3.25);
    this.mDyePack.setElementPixelPositions(500, 595, 0, 150);
    this.mDyePack.getXform().setRotationInDegree(90);
    GameObject.call(this, this.mDyePack);
}
gEngine.Core.inheritPrototype(DyePack, GameObject);


DyePack.prototype.update = function () {
    GameObject.prototype.update.call(this);
    // remember to update this.mMinion's animation
    this.mDyePack.getXform().incXPosBy(this.kDelta);
    this.mCycleLeft--;
};

DyePack.prototype.getPosition = function()
{
    return this.mDyePack.getXform().getPosition();
};


DyePack.prototype.hasExpired = function() { return this.mCycleLeft <= 0; };