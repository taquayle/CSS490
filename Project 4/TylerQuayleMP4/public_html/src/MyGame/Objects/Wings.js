/*
 * File: Wings.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, 
 * FontRenderable, SpriteAnimateRenderable, Interpolate, Wings, BoundingBox,
 * LineRenderable_BB*/
/* find out more about jslint: http://www.jslint.com/help.html */


"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Wings(texture, atX, atY, kD, offX, offY, sho) {
    this.kDelta = kD;
    this.mShowInfo = false;
    this.mSToggle = false;
    this.offX = offX;
    this.offY = offY;
    this.mWing = new SpriteAnimateRenderable(texture);
    this.mWing.setColor([1, 0, 0, 0]);
    this.mWing.getXform().setPosition(atX, atY);
    this.mWing.getXform().setSize(12, 9.6);
    this.mWing.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mWing.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mWing.setAnimationSpeed(30);
    

    GameObject.call(this, this.mWing);

    this.mIntX = new Interpolate(atX + offX, 120, .05);
    this.mIntY = new Interpolate(atY + offY, 120, .05);
    
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([1, 1, 1, 1]);
    this.mInfo.setTextHeight(1.25);
    
    this.border = new LineRenderable_BB(this.getBBox());
    this.mShowBorder = sho; 
}
gEngine.Core.inheritPrototype(Wings, GameObject);

Wings.prototype.draw = function (mCamera) {

    this.mWing.draw(mCamera);
    if(this.mShowInfo)
      this.mInfo.draw(mCamera);
    if(this.mShowBorder)
        this.border.draw(mCamera);
};

Wings.prototype.update = function () {
    this.mWing.updateAnimation();
    this.mIntX.updateInterpolation();
    this.mIntY.updateInterpolation();
    if(this.mShowBorder)
        this.border.updateLine(this.getBBox());
};

Wings.prototype.updateInfo = function()
{
    var d = this.mWing.getXform();
    var info = "(" + d.getXPos().toPrecision(4);
    info += "," + d.getYPos().toPrecision(4) + ")";
    info += " A[" + this.getAlpha().toPrecision(2) +"]";
    this.mInfo.setText(info);
    this.mInfo.getXform().setPosition(d.getXPos() - (d.getSize()[0]), 
                                        d.getYPos() - (d.getSize()[1]/2));
};

Wings.prototype.moveTo = function(xform)
{
    this.mIntX.setFinalValue(xform.getXPos() + this.offX);
    this.mIntY.setFinalValue(xform.getYPos() + this.offY);
    this.mWing.getXform().setXPos(this.mIntX.getValue());
    this.mWing.getXform().setYPos(this.mIntY.getValue());
};

Wings.prototype.setSpeed = function(kDel){this.kDelta = kDel;};
Wings.prototype.getSpeed = function() {return this.kDelta;};
Wings.prototype.slowDown = function() { this.kDelta -= .1; };

Wings.prototype.getAlpha = function(){return this.mWing.getColor()[3];};

Wings.prototype.getPosition = function()
{
    return this.mWing.getXform().getPosition();
};

Wings.prototype.getBackEdge = function()
{
    var edge = this.mWing.getXform();
    return (edge.getXPos() + (edge.getWidth()/2));
};

Wings.prototype.getTopEdge = function()
{
    var edge = this.mWing.getXform();
    return (edge.getYPos() + (edge.getHeight()/2));
};
Wings.prototype.getBotEdge = function()
{
    var edge = this.mWing.getXform();
    return (edge.getYPos() - (edge.getHeight()/2));
};
Wings.prototype.hit = function()
{
    var c = this.mWing.getColor();
    c[3] += .2;
    this.mWing.setColor(c);
};

Wings.prototype.checkForCollide = function(inBox)
{
    if(this.getBBox().intersectsBound(inBox))
    {
        return true;
    }
    return false;
};

Wings.prototype.checkForPixelCollide = function(check,h)
{
    if(this.pixelTouches(check, h))
    {
        this.hit();
        return true;
    }
    return false;
};
Wings.prototype.setInfo = function(info) 
{ this.mShowInfo = info;
    this.updateInfo();
};

Wings.prototype.showBorder = function()
{   
    this.mShowBorder = !this.mShowBorder;
    this.border.setShowLine(this.mShowBorder);
    this.border.setDrawVertices(this.mShowBorder);
};