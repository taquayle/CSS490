/*
 * File: Patrol.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, FontRenderable, SpriteAnimateRenderable, Interpolate, Wings, BoundingBox, Transform*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Patrol(texture, atX, atY, kD, sho, mov) {
    
    this.kDelta = .3;
    
    this.mShowInfo = false;
    this.mShowBorder = false;
    this.mSToggle = false;
    this.mMoveToggle = mov;
    this.mShake = new ShakePosition(3.5, 3.5, 4, 60);
    
    
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
    
    this.mTopWing = new Wings(texture, atX, atY, kD, 10, 6, sho);
    this.mBotWing = new Wings(texture, atX, atY, kD, 10, -6, sho);
    
    GameObject.call(this, this.mHead);
    
    this.interp = new Interpolate(10, 3000, .5);
    this.interp.setFinalValue(20);
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([1, 1, 1, 1]);
    this.mInfo.setTextHeight(1.5);
    
    this.border = new LineRenderable_BB(this.getBBox());
    this.bigBox = new BoundingBox(0,0,0);
    this.updateBigBox();
    this.bigBord = new LineRenderable_BB(this.bigBox);
    this.mShowBorder = sho;
}
gEngine.Core.inheritPrototype(Patrol, GameObject);

Patrol.prototype.draw = function (mCamera) {
    this.mHead.draw(mCamera);
    this.mBotWing.draw(mCamera);
    this.mTopWing.draw(mCamera);
    if(this.mShowInfo)
      this.mInfo.draw(mCamera);
    if(this.mShowBorder)
    {
       this.border.draw(mCamera);
       this.bigBord.draw(mCamera);
    }
        
};

Patrol.prototype.update = function () {
    this.mBotWing.update();
    this.mBotWing.moveTo(this.mHead.getXform());
    this.mTopWing.update();
    this.mTopWing.moveTo(this.mHead.getXform());
    if(this.mMoveToggle)
        this.randomMove();
    
    if(this.mSToggle)
    {
        if(this.mShake.shakeDone())
        {
            this.mSToggle = false;
            this.mShake = new ShakePosition(3.5, 3.5, 4, 60);
        }
        else
        {
            var s = this.mShake.getShakeResults();
            this.mHead.getXform().setSize(7.5-s[0], 7.5-s[1]);
        }
    }
    

    this.updateBigBox();
    if(this.mShowBorder)
    {
        
        this.bigBord.updateLine(this.bigBox);
        this.border.updateLine(this.getBBox());
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

Patrol.prototype.toggleMovement = function(){this.mMoveToggle = !this.mMoveToggle;};
Patrol.prototype.setSpeed = function(kDel){this.kDelta = kDel;};
Patrol.prototype.getSpeed = function() {return this.kDelta;};
Patrol.prototype.slowDown = function() { this.kDelta -= .1; };
Patrol.prototype.getTopWing = function(){return this.mTopWing;};
Patrol.prototype.getWingAlpha = function(){return [this.mTopWing.getAlpha(), this.mBotWing.getAlpha()];};
Patrol.prototype.getBotWing = function(){return this.mBotWing;};
Patrol.prototype.getPosition = function()
{
    return this.mHead.getXform().getPosition();
};

Patrol.prototype.showBorder = function()
{
    this.mShowBorder = !this.mShowBorder;
    this.border.setShowLine(this.mShowBorder);
    this.border.setDrawVertices(this.mShowBorder);
    this.bigBord.setShowLine(this.mShowBorder);
    this.bigBord.setDrawVertices(this.mShowBorder);
    this.mBotWing.showBorder();
    this.mTopWing.showBorder();
};

Patrol.prototype.shake = function(){ this.mSToggle = true; };

Patrol.prototype.shove = function(){ this.mHead.getXform().incXPosBy(5);};

Patrol.prototype.setInfo = function(info) 
{   
    this.mShowInfo = info;
    this.mBotWing.setInfo(info);
    this.mTopWing.setInfo(info);
    this.updateInfo();
};

Patrol.prototype.checkForBigBoxCollide = function(inBox)
{
    return this.bigBox.intersectsBound(inBox);
};
Patrol.prototype.checkForCollide = function(inBox)
{
    if(this.getBBox().intersectsBound(inBox))
    {

        return true;
    }
    
    return  (  this.mTopWing.checkForCollide(inBox)
            || this.mBotWing.checkForCollide(inBox));
};
Patrol.prototype.checkForDyeCollide = function(inBox)
{
    if(this.getBBox().intersectsBound(inBox))
    {
        return true;
    }
    return false;
};

Patrol.prototype.getFrontEdge = function()
{
    var edge = this.mHead.getXform();
    return (edge.getXPos() - (edge.getWidth()/2));
};

Patrol.prototype.updateBigBox = function()
{
    var fE = this.getFrontEdge();
    var baE = this.mTopWing.getBackEdge();
    var tE = this.mTopWing.getTopEdge();
    var boE = this.mBotWing.getBotEdge();
    var cX = (fE + baE)/2;
    var cY = (tE + boE)/2;
    this.bigBox.setBounds([cX, cY], baE - fE, (tE - boE) * 1.5);
};

Patrol.prototype.checkForPixelCollide = function (check, h)
{
    if(this.pixelTouches(check, h))
    {
        this.shake();
        this.shove();
        return true;
    }
    return  (  this.mTopWing.checkForPixelCollide(check, h)
            || this.mBotWing.checkForPixelCollide(check, h));
};
//Only needed for modularization 
Patrol.prototype.hasExpired = function() { return false; };
Patrol.prototype.inBound = function() {return false;};