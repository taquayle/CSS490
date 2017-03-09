/* 
 * File: RigidRectangle_Collision.js
 * Detects RigidRectangle collisions
 */

/*jslint node: true, vars:true , white: true*/
/*global RigidShape, RigidRectangle, vec2, LineRenderable */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";

//RigidRectangle.prototype.containsPos = function (pos) {
//    var rPos = this.getPosition();
//    var rMinX = rPos[0] - this.getWidth() / 2;
//    var rMaxX = rPos[0] + this.getWidth() / 2;
//    var rMinY = rPos[1] - this.getHeight() / 2;
//    var rMaxY = rPos[1] + this.getHeight() / 2;
//
//    return ((rMinX < pos[0]) && (rMaxX > pos[0]) && 
//            (rMinY < pos[1] && rMaxY > pos[1]));
//};
//
//RigidRectangle.prototype.collidedRectRect = function(r1, r2) {
//    var r1Pos = r1.getPosition();
//    var r1MinX = r1Pos[0] - r1.getWidth() / 2;
//    var r1MaxX = r1Pos[0] + r1.getWidth() / 2;
//    var r1MinY = r1Pos[1] - r1.getHeight() / 2;
//    var r1MaxY = r1Pos[1] + r1.getHeight() / 2;
//
//    var r2Pos = r2.getPosition();
//    var r2MinX = r2Pos[0] - r2.getWidth() / 2;
//    var r2MaxX = r2Pos[0] + r2.getWidth() / 2;
//    var r2MinY = r2Pos[1] - r2.getHeight() / 2;
//    var r2MaxY = r2Pos[1] + r2.getHeight() / 2;
//
//    return ((r1MaxX > r2MinX) && (r1MinX < r2MaxX) &&
//            (r1MaxY > r2MinY) && (r1MinY < r2MaxY));
//};

var SupportStruct = function () {
    this.mSupportPoint = null;
    this.mSupportPointDist = 0;
};
var tmpSupport = new SupportStruct();

RigidRectangle.prototype.findSupportPoint = function (dir, ptOnEdge) {
    //the longest project length
    var vToEdge;
    var projection;

    tmpSupport.mSupportPointDist = -9999999;
    tmpSupport.mSupportPoint = null;
    //check each vector of other object
    for (var i = 0; i < this.mVertex.length; i++) {
        vToEdge = this.mVertex[i].subtract(ptOnEdge);
        projection = vToEdge.dot(dir);
        
        //find the longest distance with certain edge
        //dir is -n direction, so the distance should be positive       
        if ((projection > 0) && (projection > tmpSupport.mSupportPointDist)) {
            tmpSupport.mSupportPoint = this.mVertex[i];
            tmpSupport.mSupportPointDist = projection;
        }
    }
};

/**
 * Find the shortest axis that overlapping
 * @memberOf Rectangle
 * @param {Rectangle} otherRect  another rectangle that being tested
 * @param {CollisionInfo} collisionInfo  record the collision information
 * @returns {Boolean} true if has overlap part in all four directions.
 * the code is convert from http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032
 */
RigidRectangle.prototype.findAxisLeastPenetration = function (otherRect, collisionInfo) {

    var n;
    var supportPoint;

    var bestDistance = 999999;
    var bestIndex = null;

    var hasSupport = true;
    var i = 0;

    while ((hasSupport) && (i < this.mFaceNormal.length)) {
        // Retrieve a face normal from A
        n = this.mFaceNormal[i];

        // use -n as direction and the vectex on edge i as point on edge
        var dir = n.scale(-1);
        var ptOnEdge = this.mVertex[i];
        // find the support on B
        // the point has longest distance with edge i 
        otherRect.findSupportPoint(dir, ptOnEdge);
        hasSupport = (tmpSupport.mSupportPoint !== null);
        
        //get the shortest support point depth
        if ((hasSupport) && (tmpSupport.mSupportPointDist < bestDistance)) {
            bestDistance = tmpSupport.mSupportPointDist;
            bestIndex = i;
            supportPoint = tmpSupport.mSupportPoint;
        }
        i = i + 1;
    }
    if (hasSupport) {
        //all four directions have support point
        var bestVec = this.mFaceNormal[bestIndex].scale(bestDistance);
        collisionInfo.setInfo(bestDistance, this.mFaceNormal[bestIndex], supportPoint.add(bestVec));
    }
    return hasSupport;
};
/**
 * Check for collision between RigidRectangle and RigidRectangle
 * @param {Rectangle} r1 Rectangle object to check for collision status
 * @param {Rectangle} r2 Rectangle object to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf Rectangle
 */    
var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();
RigidRectangle.prototype.collidedRectRect = function (r1, r2, collisionInfo) {

    var status1 = false;
    var status2 = false;

    //find Axis of Separation for both rectangle
    status1 = r1.findAxisLeastPenetration(r2, collisionInfoR1);

    if (status1) {
        status2 = r2.findAxisLeastPenetration(r1, collisionInfoR2);
        if (status2) {
            //if both of rectangles are overlapping, choose the shorter normal as the normal       
            if (collisionInfoR1.getDepth() < collisionInfoR2.getDepth()) {
                var depthVec = collisionInfoR1.getNormal().scale(collisionInfoR1.getDepth());
                collisionInfo.setInfo(collisionInfoR1.getDepth(), collisionInfoR1.getNormal(), collisionInfoR1.mStart.subtract(depthVec));
            } else {
                collisionInfo.setInfo(collisionInfoR2.getDepth(), collisionInfoR2.getNormal().scale(-1), collisionInfoR2.mStart);
            }
        } 
    } 
    return status1 && status2;
};
RigidRectangle.prototype.collided = function(otherShape) { 
//    var status = false;
//    switch (otherShape.rigidType()) {
//        case RigidShape.eRigidType.eRigidCircle:
//            status = this.collidedRectCirc(this, otherShape);
//            break;
//        case RigidShape.eRigidType.eRigidRectangle:
//            status = this.collidedRectRect(otherShape, this);
//            break;
//    }
//    return status;
    return this.collidedRectRect(otherShape, this);
};