/*
 * File: Patrol.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, FontRenderable, SpriteAnimateRenderable, Interpolate*/
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Patrol(texture, atX, atY, kD) {
    this.mCycleLeft = 300; // 5 Seconds life
    this.kDelta = kD;
    this.mShowInfo = false;
    this.mShake = new ShakePosition(4, .02, 20, 300);
    this.mSToggle = false;
    
    this.mHead = new SpriteRenderable(texture);
    this.mHead.setColor([1, 1, 1, 0]);
    this.mHead.getXform().setPosition(atX, atY);
    this.mHead.getXform().setSize(7.5, 7.5);
    this.mHead.setElementPixelPositions(150, 300, 0, 200);
    this.mBotWing = new SpriteAnimateRenderable(texture);
    this.mBotWing.setColor([1, 1, 1, 0]);
    this.mBotWing.getXform().setPosition(atX + 10, atY - 6);
    this.mBotWing.getXform().setSize(12, 9.6);
    this.mBotWing.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mBotWing.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mBotWing.setAnimationSpeed(30);
    
    this.mTopWing = new SpriteAnimateRenderable(texture);
    this.mTopWing.setColor([1, 1, 1, 0]);
    this.mTopWing.getXform().setPosition(atX + 10, atY + 6);
    this.mTopWing.getXform().setSize(12, 9.6);
    this.mTopWing.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mTopWing.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mTopWing.setAnimationSpeed(30);
    GameObject.call(this, this.mHead);
    
    this.interp = new Interpolate(10, 3000, .5);
    this.interp.setFinalValue(20);
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([0, 0, 0, 1]);
    this.mInfo.setTextHeight(1.5);
    this.updateInfo();
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
    this.mBotWing.updateAnimation();
    this.mTopWing.updateAnimation();
    this.interp.updateInterpolation();

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
    info += " [" + this.kDelta.toPrecision(3) + "]";
    this.mInfo.setText(info);
    this.mInfo.getXform().setPosition(d.getXPos() - (d.getSize()[0]), 
                                        d.getYPos() - (d.getSize()[1]/2));
};


Patrol.prototype.setSpeed = function(kDel){this.kDelta = kDel;};
Patrol.prototype.getSpeed = function() {return this.kDelta;};
Patrol.prototype.slowDown = function() { this.kDelta -= .1; };

Patrol.prototype.getPosition = function()
{
    return this.mHead.getXform().getPosition();
};



Patrol.prototype.shake = function(){ this.mSToggle = true; };

Patrol.prototype.setInfo = function(info) 
{ this.mShowInfo = info;
    this.updateInfo();
};

