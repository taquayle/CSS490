/* 
 * File: RigidShape_Collision.js
 * Detects RigidPoint collisions
 */

/*jslint node: true, vars:true , white: true*/
/*global RigidShape, vec2, LineRenderable */
/* find out more about jslint: http://www.jslint.com/help.html */
"use strict";


RigidShape.prototype.checkCircRecVertex = function(v, circPt, r, info) {
    //the center of circle is in corner region of mVertex[nearestEdge]
    var dis = vec2.length(v);
    //compare the distance with radium to decide collision
    if (dis > r)
        return false;
    var radiusVec = [0, 0];
    var ptAtCirc = [0, 0];
    vec2.scale(v, v, 1/dis); // normalize
    vec2.scale(radiusVec, v, -r);
    vec2.add(ptAtCirc, circPt, radiusVec);
    info.setInfo(r - dis, v, ptAtCirc);
    return true;
};

/**
 * Check for collision between RigidRectangle and Circle
 * @param {Circle} otherCir circle to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf RigidRectangle
 */
RigidShape.prototype.collidedRectCirc = function (otherCir, collisionInfo) {
    var outside = false;
    var bestDistance = -Number.MAX_VALUE;
    var nearestEdge = 0; 
    var vToC = [0, 0];
    var circ2Pos = [0, 0], projection;
    var i = 0;
    while ((!outside) && (i<4)) {
        //find the nearest face for center of circle  
        document.getElementById("D4").innerHTML = this.mVertex[i];
        circ2Pos = otherCir.getPosition();
        vec2.sub(vToC, circ2Pos, this.mVertex[i]);
        projection = vec2.dot(vToC, this.mFaceNormal[i]);
        if (projection > bestDistance) {
            outside = (projection > 0); // if projection < 0, inside
            bestDistance = projection;
            nearestEdge = i;
        }
        i++;
    }
    var dis;
    var radiusVec = [0, 0];
    var ptAtCirc = [0, 0];
    
    if (!outside) { // inside
        //the center of circle is inside of rectangle
        vec2.scale(radiusVec, this.mFaceNormal[nearestEdge], otherCir.mRadius);
        dis = otherCir.mRadius - bestDistance; // bestDist is -ve
        vec2.subtract(ptAtCirc, circ2Pos, radiusVec);
        collisionInfo.setInfo(dis, this.mFaceNormal[nearestEdge], ptAtCirc);
        return true;
    }
    
    //the center of circle is outside of rectangle

    //v1 is from left vertex of face to center of circle 
    //v2 is from left vertex of face to right vertex of face
    var v1 = [0, 0], v2 = [0, 0];
    vec2.subtract(v1, circ2Pos, this.mVertex[nearestEdge]);
    vec2.subtract(v2, this.mVertex[(nearestEdge + 1) % 4], this.mVertex[nearestEdge]);
    var dot = vec2.dot(v1, v2);

    if (dot < 0) {
        return this.checkCircRecVertex(v1, circ2Pos, otherCir.mRadius, collisionInfo);
    } else {
        //the center of circle is in corner region of mVertex[nearestEdge+1]
        
        //v1 is from right vertex of face to center of circle 
        //v2 is from right vertex of face to left vertex of face
        vec2.subtract(v1, circ2Pos, this.mVertex[(nearestEdge + 1) % 4]);
        vec2.scale(v2, v2, -1);
        dot = vec2.dot(v1, v2); 
        if (dot < 0) {
            return this.checkCircRecVertex(v1, circ2Pos, otherCir.mRadius, collisionInfo);
        } else {
            //the center of circle is in face region of face[nearestEdge]
            if (bestDistance < otherCir.mRadius) {
                vec2.scale(radiusVec, this.mFaceNormal[nearestEdge], otherCir.mRadius);
                dis = otherCir.mRadius - bestDistance;
                vec2.subtract(ptAtCirc, circ2Pos, radiusVec);
                collisionInfo.setInfo(dis, this.mFaceNormal[nearestEdge], ptAtCirc);
                return true;
            } else {
                return false;
            }
        }
    }
    return true;
};