/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/*global RigidRectangle, vec2 */

RigidRectangle.prototype.collided = function (otherShape, collisionInfo) {
    var status = false;
    if (otherShape.mType === "RigidCircle") {
        status = this.collidedRectCirc(otherShape, collisionInfo);
    } else {
        status = this.collideRectRect(this, otherShape, collisionInfo);
    }
    return status;
};

var SupportStruct = function () {
    this.mSupportPoint = null;
    this.mSupportPointDist = 0;
};
var tmpSupport = new SupportStruct();
RigidRectangle.prototype.findSupportPoint = function (dir, ptOnEdge) {
    //the longest project length
    var vToEdge = [0, 0];
    var projection;

    tmpSupport.mSupportPointDist = -Number.MAX_VALUE;
    tmpSupport.mSupportPoint = null;
    //check each vector of other object
    for (var i = 0; i < this.mVertex.length; i++) {
        vec2.subtract(vToEdge, this.mVertex[i], ptOnEdge);
        projection = vec2.dot(vToEdge, dir);
        
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
 * @memberOf RigidRectangle
 * @param {RigidRectangle} otherRect  another rectangle that being tested
 * @param {CollisionInfo} collisionInfo  record the collision information
 * @returns {Boolean} true if has overlap part in all four directions.
 * the code is convert from http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032
 */
RigidRectangle.prototype.findAxisLeastPenetration = function (otherRect, collisionInfo) {

    var n;
    var supportPoint;

    var bestDistance = Number.MAX_VALUE;
    var bestIndex = null;

    var hasSupport = true;
    var i = 0;

    var dir = [0, 0];
    while ((hasSupport) && (i < this.mFaceNormal.length)) {
        // Retrieve a face normal from A
        n = this.mFaceNormal[i];

        // use -n as direction and the vectex on edge i as point on edge    
        vec2.scale(dir, n, -1);
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
        var bestVec = [0, 0];
        vec2.scale(bestVec, this.mFaceNormal[bestIndex], bestDistance);
        var atPos = [0, 0];
        vec2.add(atPos, supportPoint, bestVec);
        collisionInfo.setInfo(bestDistance, this.mFaceNormal[bestIndex], atPos);
    }
    return hasSupport;
};
/**
 * Check for collision between RigidRectangle and RigidRectangle
 * @param {RigidRectangle} r1 RigidRectangle object to check for collision status
 * @param {RigidRectangle} r2 RigidRectangle object to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf RigidRectangle
 */    
var collisionInfoR1 = new CollisionInfo();
var collisionInfoR2 = new CollisionInfo();
RigidRectangle.prototype.collideRectRect = function (r1, r2, collisionInfo) {
    var status1 = false;
    var status2 = false;

    //find Axis of Separation for both rectangle
    status1 = r1.findAxisLeastPenetration(r2, collisionInfoR1);

    if (status1) {
        status2 = r2.findAxisLeastPenetration(r1, collisionInfoR2);
        if (status2) {
            var depthVec = [0, 0];
            //if both of rectangles are overlapping, choose the shorter normal as the normal       
            if (collisionInfoR1.getDepth() < collisionInfoR2.getDepth()) {
                vec2.scale(depthVec, collisionInfoR1.getNormal(), collisionInfoR1.getDepth());
                var pos = [0, 0];
                vec2.subtract(pos, collisionInfoR1.mStart, depthVec);
                collisionInfo.setInfo(collisionInfoR1.getDepth(), collisionInfoR1.getNormal(), pos);
            } else {
                vec2.scale(depthVec, collisionInfoR2.getNormal(), -1);
                collisionInfo.setInfo(collisionInfoR2.getDepth(), depthVec, collisionInfoR2.mStart);
            }
        } 
    }
    return status1 && status2;
};

//RigidRectangle.prototype.collidedRectCirc = function (otherCir, collisionInfo) {
//
//    var inside = true;
//    var bestDistance = -99999;
//    var nearestEdge = 0;
//    var i, v = [0,0];
//    var circ2Pos, projection;
//    for (i = 0; i < 4; i++) {
//        //find the nearest face for center of circle        
//        circ2Pos = otherCir.getPosition();
//        vec2.sub(v, circ2Pos, this.mVertex[i]);
//        projection = vec2.dot(v, this.mFaceNormal[i]);
//        if (projection > 0) {
//            //if the center of circle is outside of rectangle
//            bestDistance = projection;
//            nearestEdge = i;
//            inside = false;
//            break;
//        }
//        if (projection > bestDistance) {
//            bestDistance = projection;
//            nearestEdge = i;
//        }
//    }
//    var dis, normal, radiusVec = [0,0];
//    if (!inside) {
//        //the center of circle is outside of rectangle
//
//        //v1 is from left vertex of face to center of circle 
//        //v2 is from left vertex of face to right vertex of face
//        var v1 = [0,0], v2 = [0,0];
//        //var v1 = circ2Pos.subtract(this.mVertex[nearestEdge]);
//        vec2.sub(v1, circ2Pos, this.mVertex[nearestEdge]);
//        //var v2 = this.mVertex[(nearestEdge + 1) % 4].subtract(this.mVertex[nearestEdge]);
//        vec2.sub(v2, this.mVertex[(nearestEdge + 1) % 4], this.mVertex[nearestEdge]);
//        //var dot = v1.dot(v2);
//        var dot = vec2.dot(v1, v2);
//        
//        if (dot < 0) {
//            //the center of circle is in corner region of mVertex[nearestEdge]
//            //dis = v1.length();
//            dis = vec2.length(v1);
//            //compare the distance with radium to decide collision
//            if (dis > otherCir.mRadius) {
//                return false;
//            }
//
//            //normal = v1.normalize();
//            normal = vec2.normalize(v1, v1);
//            //radiusVec = normal.scale(-otherCir.mRadius);
//            vec2.scale(radiusVec, normal, -otherCir.mRadius);
//            collisionInfo.setInfo(otherCir.mRadius - dis, normal, circ2Pos.add(radiusVec));
//        } else {
//            //the center of circle is in corner region of mVertex[nearestEdge+1]
//
//            //v1 is from right vertex of face to center of circle 
//            //v2 is from right vertex of face to left vertex of face
//            //v1 = circ2Pos.subtract(this.mVertex[(nearestEdge + 1) % 4]);
//            vec2.subtract(v1, circ2Pos, this.mVertex[(nearestEdge + 1) % 4]);
//            //v2 = v2.scale(-1);
//            vec2.scale(v2, v2, -1);
//            //dot = v1.dot(v2); 
//            dot = vec2.dot(v1, v2);
//            if (dot < 0) {
//                dis = vec2.length(v1);
//                //compare the distance with radium to decide collision
//                if (dis > otherCir.mRadius) {
//                    return false;
//                }
//                //normal = v1.normalize();
//                normal = vec2.normalize(v1, v1);
//                //radiusVec = normal.scale(-otherCir.mRadius);
//                vec2.scale(radiusVec, normal, -otherCir.mRadius);
//                collisionInfo.setInfo(otherCir.mRadius - dis, normal, circ2Pos.add(radiusVec));
//            } else {
//                //the center of circle is in face region of face[nearestEdge]
//                if (bestDistance < otherCir.mRadius) {
//                    //radiusVec = this.mFaceNormal[nearestEdge].scale(otherCir.mRadius);
//                    vec2.scale(radiusVec, this.mFaceNormal[nearestEdge], otherCir.mRadius);
//                    var circ2PosSubRadius = [0,0];
//                    vec2.sub(circ2PosSubRadius, circ2Pos, radiusVec);
//                    collisionInfo.setInfo(otherCir.mRadius - bestDistance, this.mFaceNormal[nearestEdge], circ2PosSubRadius);
//                } else {
//                    return false;
//                }
//            }
//        }
//    } else {
//        //the center of circle is inside of rectangle
//        //radiusVec = this.mFaceNormal[nearestEdge].scale(otherCir.mRadius);
//        radiusVec = [0,0];
//        vec2.scale(radiusVec, this.mFaceNormal[nearestEdge], otherCir.mRadius);
//        
//        var circ2PosSubRadius = [0,0];
//        vec2.sub(circ2PosSubRadius, circ2Pos, radiusVec);
//        collisionInfo.setInfo(otherCir.mRadius - bestDistance, this.mFaceNormal[nearestEdge],  circ2PosSubRadius);
//    }
//    return true;
//};