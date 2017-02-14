/*
 * File: Patrol.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, FontRenderable, SpriteAnimateRenderable, Interpolate, Wings, BoundingBox*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Patrol(texture, atX, atY, kD) {
    
    this.kDelta = .3;
    
    this.mShowInfo = false;
    
    this.mShake = new ShakePosition(4, .02, 20, 300);
    this.mSToggle = false;
    
    this.dir = [-1, 0, 1];
    this.xDirDesc = ["left ", " ", "right "];
    this.yDirDesc = [" down ", " ", " up "];
    this.xDir = this.dir[Math.floor(Math.random() * this.dir.length)];
    this.yDir = this.dir[Math.floor(Math.random() * this.dir.length)];
    this.mCycleLeft = 60;
    
    this.mHead = new SpriteRenderable(texture);
    this.mHead.setColor([1, 1, 1, 0]);
    this.mHead.getXform().setPosition(atX, atY);
    this.mHead.getXform().setSize(7.5, 7.5);
    this.mHead.setElementPixelPositions(150, 300, 0, 200);
    
    this.mTopWing = new Wings(texture, atX, atY, kD, 10, 6);
    this.mBotWing = new Wings(texture, atX, atY, kD, 10, -6);
    
    GameObject.call(this, this.mHead);
    
    this.interp = new Interpolate(10, 3000, .5);
    this.interp.setFinalValue(20);
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([1, 1, 1, 1]);
    this.mInfo.setTextHeight(1.5);
    
    //this.bBox = this.mHead.getBBox();
}
gEngine.Core.inheritPrototype(Patrol, GameObject);

Patrol.prototype.draw = function (mCamera) {
    this.mHead.draw(mCamera);
    this.mBotWing.draw(mCamera);
    this.mTopWing.draw(mCamera);
    if(this.mShowInfo)
      this.mInfo.draw(mCamera);
};

Patrol.prototype.update = function () {
    this.mBotWing.update();
    this.mBotWing.moveTo(this.mHead.getXform());
    this.mTopWing.update();
    this.mTopWing.moveTo(this.mHead.getXform());
 
    //this.randomMove();
    if(this.mSToggle)
    {
        if(this.mShake.shakeDone())
        {
            this.mSToggle = false;
            this.mShake = new ShakePosition(4, .02, 20, 300);
        }
        else
        {
            var s = this.mShake.getShakeResults();
            this.mHead.getXform().setSize(2-s[0], 3.25-s[1]);
        }
    }
};

Patrol.prototype.updateInfo = function()
{
    var d = this.mHead.getXform();
    var info = "(" + d.getXPos().toPrecision(4);
    info += "," + d.getYPos().toPrecision(4) + ")";
    info += " [" +this.yDirDesc[this.yDir+1] + this.xDirDesc[this.xDir+1] + "]";
    this.mInfo.setText(info);
    this.mInfo.getXform().setPosition(d.getXPos() - (d.getSize()[0]), 
                                        d.getYPos() - (d.getSize()[1]/2));
};

Patrol.prototype.randomMove = function()
{
    this.mCycleLeft--;
    if(this.mCycleLeft <= 0){
        this.newDirection();}
    else
    {
        this.mHead.getXform().incXPosBy((this.xDir * this.kDelta));
        this.mHead.getXform().incYPosBy((this.yDir * this.kDelta));
    }
};

Patrol.prototype.newDirection = function()
{
    this.xDir = this.dir[Math.floor(Math.random() * this.dir.length)];
    this.yDir = this.dir[Math.floor(Math.random() * this.dir.length)];
    this.mCycleLeft = 60;
};


Patrol.prototype.setSpeed = function(kDel){this.kDelta = kDel;};
Patrol.prototype.getSpeed = function() {return this.kDelta;};
Patrol.prototype.slowDown = function() { this.kDelta -= .1; };

Patrol.prototype.getPosition = function()
{
    return this.mHead.getXform().getPosition();
};



Patrol.prototype.shake = function(){ this.mSToggle = true; };

Patrol.prototype.shove = function(){ this.mHead.getXform().incXPosBy(10);};

Patrol.prototype.setInfo = function(info) 
{   
    this.mShowInfo = info;
    this.mBotWing.setInfo(info);
    this.mTopWing.setInfo(info);
    this.updateInfo();
};

Patrol.prototype.checkForCollide = function(inBox)
{
    if(this.mHead.getBBox().intersectsBound(inBox))
    {
        return true;
    }
    return false;
};
