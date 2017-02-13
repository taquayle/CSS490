/*
 * File: DyePack.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, FontRenderable*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DyePack(texture, atX, atY, kD) {
    this.mCycleLeft = 300; // 5 Seconds life
    this.kDelta = kD;
    this.mShowInfo = false;
    
    this.mDyePack = new SpriteRenderable(texture);
    this.mDyePack.setColor([1, 1, 1, 0]);
    this.mDyePack.getXform().setPosition(atX, atY);
    this.mDyePack.getXform().setSize(2, 3.25);
    this.mDyePack.setElementPixelPositions(500, 595, 0, 150);
    this.mDyePack.getXform().setRotationInDegree(90);
    GameObject.call(this, this.mDyePack);
    
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([0, 0, 0, 1]);
    this.mInfo.setTextHeight(1.5);
    this.updateInfo();
}
gEngine.Core.inheritPrototype(DyePack, GameObject);

DyePack.prototype.draw = function (mCamera) {
    this.mDyePack.draw(mCamera);
    if(this.mShowInfo)
      this.mInfo.draw(mCamera);
};

DyePack.prototype.update = function () {
    this.mDyePack.getXform().incXPosBy(this.kDelta);
    this.mCycleLeft--;
    if(this.mShowInfo)
        this.updateInfo();
};

DyePack.prototype.updateInfo = function()
{
    var d = this.mDyePack.getXform();
    var info = "(" + d.getXPos().toPrecision(4);
    info += "," + d.getYPos().toPrecision(4) + ")";
    info += " [" + this.kDelta + "]";
    this.mInfo.setText(info);
    this.mInfo.getXform().setPosition(d.getXPos() - (d.getSize()[0]), 
                                        d.getYPos() - (d.getSize()[1]/2));
};


DyePack.prototype.setSpeed = function(kDel){this.kDelta = kDel;};
DyePack.prototype.getSpeed = function() {return this.kDelta;};

DyePack.prototype.getPosition = function()
{
    return this.mDyePack.getXform().getPosition();
};


DyePack.prototype.hasExpired = function() { return this.mCycleLeft <= 0; };


DyePack.prototype.getSpeed = function() { return this.kDelta;};

DyePack.prototype.slowDown = function() { this.kDelta -= .1; };

DyePack.prototype.setInfo = function(info) 
{ this.mShowInfo = info;
    this.updateInfo();
};

