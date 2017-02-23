/* 
 * File: RigidRectangle.js
 * Defines a rigid Rectangle
 */

/*jslint node: true, vars:true , white: true*/
/*global gEngine, RigidShape, vec2, LineRenderable */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";

function RigidRectangle(xform, w, h) {
    RigidShape.call(this, xform);
    this.mSides = new LineRenderable();
    
    this.mWidth = w;
    this.mHeight = h;
    this.mAngle = 0;
    this.mFront = null;
}
gEngine.Core.inheritPrototype(RigidRectangle, RigidShape);

RigidRectangle.prototype.rigidType = function () {
    return RigidShape.eRigidType.eRigidRectangle;
};

RigidRectangle.prototype.draw = function (aCamera) {
    if (!this.mDrawBounds) {
        return;
    }
    RigidShape.prototype.draw.call(this, aCamera);
    var x = this.getPosition()[0];
    var y = this.getPosition()[1];
    var w = (this.mWidth/2);
    var h = (this.mHeight/2);
    var newPos, faceOne, faceTwo;
    /**************************************************************************/
    // TOP EDGE - RED
    newPos = this.getAngledPos(x,y,x-w,y+h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]);  // TOP LEFT
    newPos = this.getAngledPos(x,y,x+w,y+h);
    this.mSides.setSecondVertex(newPos[0], newPos[1]); // TOP RIGHT
    this.mSides.setColor(1,0,0);
    this.mSides.draw(aCamera);

    newPos = this.getAngledPos(x,y,x+w, y+h+h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]); // NORMAL
    this.mSides.draw(aCamera);

    /**************************************************************************/
    // RIGHT EDGE - GREEN
    newPos = this.getAngledPos(x,y,x+w,y+h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]); // TOP RIGHT
    newPos = this.getAngledPos(x,y,x+w,y-h);
    this.mSides.setSecondVertex(newPos[0], newPos[1]); // BOTTOM RIGHT
    this.mSides.setColor(1,1,0);
    this.mSides.draw(aCamera);

    newPos = this.getAngledPos(x,y,x+w+h,y-h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]); // NORMAL
    this.mSides.draw(aCamera);
    /**************************************************************************/
    // BOTTOM EDGE -  BLUE
    newPos = this.getAngledPos(x,y,x+w,y-h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]); // BOTTOM RIGHT
    newPos = this.getAngledPos(x,y,x-w,y-h);
    this.mSides.setSecondVertex(newPos[0], newPos[1]);  // BOTTOM LEFT
    this.mSides.setColor(0,0,1);
    this.mSides.draw(aCamera);
    
    newPos = this.getAngledPos(x,y,x-w,y-h-h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]); // NORMAL
    this.mSides.draw(aCamera);
    /**************************************************************************/
    // LEFT EDGE - PURPLE
    newPos = this.getAngledPos(x,y,x-w,y-h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]);  // BOTTOM LEFT
    newPos = this.getAngledPos(x,y,x-w,y+h);
    this.mSides.setSecondVertex(newPos[0], newPos[1]);   // TOP LEFT
    this.mSides.setColor(1,0,1);
    this.mSides.draw(aCamera);
    
    newPos = this.getAngledPos(x,y,x-w-h,y+h);
    this.mSides.setFirstVertex(newPos[0], newPos[1]);   // NORMAL
    this.mSides.draw(aCamera);
};

RigidRectangle.prototype.getAngledPos = function (x, y, cX, cY) {
    var rX = x + ((cX-x)  * Math.cos(this.mAngle)) + ((cY-y) * Math.sin(this.mAngle));
    var rY = y - ((cX-x)  * Math.sin(this.mAngle)) + ((cY-y) * Math.cos(this.mAngle));
    return [rX, rY];};

RigidRectangle.prototype.getWidth = function () { return this.mWidth; };
RigidRectangle.prototype.getHeight = function () { return this.mHeight; };
RigidRectangle.prototype.setAngle = function(ang) { this.mAngle = -ang;};
RigidRectangle.prototype.setColor = function (color) {
    RigidShape.prototype.setColor.call(this, color);
    this.mSides.setColor(color);
};

RigidRectangle.prototype.setFront = function(gObj)
{
    var h = (this.mHeight/2);
    var w = (this.mWidth/2);
    var f = gObj.getCurrentFrontDir();
    this.mFront = [f[0]*w, f[1]*h];
};

RigidRectangle.prototype.getFaceNormal = function(x, y, cX, cY, aCamera)
{
    var newPos = this.getAngledPos(x,y,cX,cY);
    this.mSides.setFirstVertex(newPos[0], newPos[1]); // BOTTOM RIGHT
    newPos = this.getAngledPos(x,y,cX, cY);
    this.mSides.setSecondVertex(newPos[0], newPos[1]); // TOP RIGHT
    this.mSides.setColor(1,0,0);
    this.mSides.draw(aCamera);
};