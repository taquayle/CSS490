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
    
    this.mVertex = [];
    this.mFaceNormal = [];
    this.setVertices();
    this.computeFaceNormals();
}
gEngine.Core.inheritPrototype(RigidRectangle, RigidShape);


RigidRectangle.prototype.travel = function (dt) {
    var p = this.mXform.getPosition();
    // Linear
    vec2.scaleAndAdd(p, p, this.mVelocity, dt);
    this.setVertices();
    
    // angular motion
    this.rotateVertices();
    
    return this;
};

RigidRectangle.prototype.setVertices = function () {
    var center = this.mXform.getPosition();
    var hw = this.mWidth / 2;
    var hh = this.mHeight / 2;
    //0--TopLeft;1--TopRight;2--BottomRight;3--BottomLeft
    this.mVertex[0] = vec2.fromValues(center[0] - hw, center[1] - hh);
    this.mVertex[1] = vec2.fromValues(center[0] + hw, center[1] - hh);
    this.mVertex[2] = vec2.fromValues(center[0] + hw, center[1] + hh);
    this.mVertex[3] = vec2.fromValues(center[0] - hw, center[1] + hh);    
};

RigidRectangle.prototype.computeFaceNormals = function () {
    //0--Top;1--Right;2--Bottom;3--Left
    //mFaceNormal is normal of face toward outside of rectangle    
    for (var i = 0; i<4; i++) {
        var v = (i+1) % 4;
        var nv = (i+2) % 4;
        this.mFaceNormal[i] = vec2.clone(this.mVertex[v]);
        vec2.subtract(this.mFaceNormal[i], this.mFaceNormal[i], this.mVertex[nv]);
        vec2.normalize(this.mFaceNormal[i], this.mFaceNormal[i]);
    }
};

RigidRectangle.prototype.rotateVertices = function () {
    var center = this.mXform.getPosition();
    var r = this.mXform.getRotationInRad();
    for (var i = 0; i<4; i++) {
        vec2.rotateWRT(this.mVertex[i], this.mVertex[i], r, center);
    }
    this.computeFaceNormals();
};


RigidRectangle.prototype.rigidType = function () {
    return RigidShape.eRigidType.eRigidRectangle;
};


RigidRectangle.prototype.drawAnEdge = function (i1, i2, aCamera) {
    this.mSides.setFirstVertex(this.mVertex[i1][0], this.mVertex[i1][1]);  
    this.mSides.setSecondVertex(this.mVertex[i2][0], this.mVertex[i2][1]); 
    this.mSides.draw(aCamera);
};

RigidRectangle.prototype.draw = function (aCamera) {
    this.setVertices();
    this.rotateVertices();
    RigidShape.prototype.draw.call(this, aCamera);
    var i = 0;
    if(this.mDrawBounds)
        for (i=0; i<4; i++) {
            this.drawAnEdge(i, (i+1)%4, aCamera);
        }
};


RigidRectangle.prototype.getWidth = function () { return this.mWidth; };
RigidRectangle.prototype.getHeight = function () { return this.mHeight; };
RigidRectangle.prototype.setColor = function (color) {
    RigidShape.prototype.setColor.call(this, color);
    this.mSides.setColor(color);
};

RigidRectangle.prototype.update = function () {
    RigidShape.prototype.update.call(this);
};