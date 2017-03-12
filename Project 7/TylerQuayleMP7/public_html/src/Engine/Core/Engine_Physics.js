/*
 * File: EngineCore_Physics.js 
 * Physics engine supporting projection and impulse collision resolution. 
 */
/*jslint node: true, vars: true, white: true */
/*global vec2, CollisionInfo */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

var gEngine = gEngine || { };
    // initialize the variable while ensuring it is not redefined

gEngine.Physics = (function () {
    var mRelaxationCount = 5;                  // number of relaxation iteration
    var mRelaxationOffset = 1/mRelaxationCount; // porportion to apply when scaling friction
    var mPosCorrectionRate = 0.1;               // percentage of separation to project objects
    var mSystemtAcceleration = [0, -20];        // system-wide default acceleration
    
    var mRelaxationLoopCount = 0;               // the current relaxation count
    var mHasOneCollision = false;               // detect the first collision
    
    var mCollisionInfo = null;                  // information of the current collision
    
    var initialize = function() {
        mCollisionInfo = new CollisionInfo(); // to avoid allocating this constantly
    };
    
    var _positionalCorrection = function (s1, s2, collisionInfo) {
        /**********************************************************************/
        // 4.4 Physics Rep
        var s1InvMass = s1.mInvMass;
        var s2InvMass = s2.mInvMass;

        var num = collisionInfo.getDepth() / (s1InvMass + s2InvMass) * mPosCorrectionRate;
        var correctionAmount = [0,0];
        vec2.scale(correctionAmount, collisionInfo.getNormal(), num);

        var t1 = [0,0], t2 = [0,0];
        vec2.scale(t1, correctionAmount, -s1InvMass);
        vec2.scale(t2, correctionAmount, s2InvMass);
        s1.move(t1);
        s2.move(t2);
        /**********************************************************************/
        // 9.2 Impulse Rep
//        var s1InvMass = s1.getInvMass();
//        var s2InvMass = s2.getInvMass();
//        var num = collisionInfo.getDepth() / (s1InvMass + s2InvMass) * mPosCorrectionRate;
//        var correctionAmount = [0, 0];
//        vec2.scale(correctionAmount, collisionInfo.getNormal(), num);
//
//        var ca = [0, 0];
//        vec2.scale(ca, correctionAmount, s1InvMass);
//        var s1Pos = s1.getPosition();
//        vec2.subtract(s1Pos, s1Pos, ca);
//
//        vec2.scale(ca, correctionAmount, s2InvMass);
//        var s2Pos = s2.getPosition();
//        vec2.add(s2Pos, s2Pos, ca);
    };
    
    // n is the collision normal
    // v is the velocity
    // f is the friction 
    // m is the invMass
    var _applyFriction = function(n, v, f, m) {
        var tangent = vec2.fromValues(n[1], -n[0]);  // perpendicular to n
        var tComponent = vec2.dot(v, tangent);
        if (Math.abs(tComponent) < 0.01)
            return;
        
        f *= m * mRelaxationOffset;
        if (tComponent < 0) {
            vec2.scale(tangent, tangent, -f);
        } else {
            vec2.scale(tangent, tangent, f);
        }
        vec2.sub(v, v, tangent);
    };
    var resolveCollision = function (s1, s2, collisionInfo) {
        
        if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
            return;
        }
        // Step A: one collision has been found
        //mHasOneCollision = true;
        // Step B: correct positions
        _positionalCorrection(s1, s2, collisionInfo);
        document.getElementById("Debug").innerHTML = collisionInfo;
        // collision normal direction is _against_ s2
        // Step C: apply friction

        var n = collisionInfo.getNormal();


        var start = [0,0];
        vec2.scale(start, collisionInfo.mStart, (s2.mInvMass / (s1.mInvMass + s2.mInvMass)));
        var end = [0,0]; 
        vec2.scale(end, collisionInfo.mEnd, (s1.mInvMass / (s1.mInvMass + s2.mInvMass)));
        var p = [0,0];
        vec2.add(p, start, end);
        
        var r1 = [0,0], r2 = [0,0];
        vec2.sub(r1, p, s1.getPosition());
        vec2.sub(r2, p, s2.getPosition());
        var v1 = [0,0], v2 = [0,0];
        var crossR1 = [-1 * s1.mAngularVelocity * r1[1], s1.mAngularVelocity * r1[0]];
        var crossR2 = [-1 * s2.mAngularVelocity * r2[1], s2.mAngularVelocity * r2[0]];
        vec2.add(v1, s1.mVelocity, crossR1);
        vec2.add(v2, s2.mVelocity, crossR2);

        //document.getElementById("D1").innerHTML = "r1: " + r1 + " r2: " + r2 + " crossR1: " + crossR1 + " crossR2: " + crossR2 + " v1: " + v1 + "v2: " + v2;

        // Step D: compute relatively velocity of the colliding objects
        var relativeVelocity = [0, 0];
        vec2.sub(relativeVelocity, v2, v1);

        // Step E: examine the component in the normal direction
        // Relative velocity in normal direction
        var rVelocityInNormal = vec2.dot(relativeVelocity, n);
        //if objects moving apart ignore
        if (rVelocityInNormal > 0) {
            return;
        }
        
        // Step F: compute and apply response impulses for each object
        var newRestituion = Math.min(s1.getRestitution(), s2.getRestitution());
        var newFriction = Math.min(s1.getFriction(), s2.getFriction());
        
        // R cross N
        var R1crossN = [0,0];
        vec2.cross(R1crossN, r1, n);
        var R2crossN = [0,0];
        vec2.cross(R2crossN, r2, n);
      
        // Calc impulse scalar
        var jN = -(1 + newRestituion) * rVelocityInNormal;
        
        jN = jN / (s1.getInvMass() + s2.getInvMass() +
                R1crossN[2] * R1crossN[2] * s1.mInertia +
                R2crossN[2] * R2crossN[2] * s2.mInertia);

        var impulse = [0, 0];
        vec2.scale(impulse, n, jN);
        
        var impScale = [0,0];
        vec2.scale(impScale, impulse, s1.mInvMass);
        vec2.sub(s1.mVelocity, s1.mVelocity, impScale);

        vec2.scale(impScale, impulse, s2.mInvMass);
        vec2.add(s2.mVelocity, s2.mVelocity, impScale);
        
       
        s1.mAngularVelocity -= R1crossN[2] * jN * s1.mInertia;
        s2.mAngularVelocity += R2crossN[2] * jN * s2.mInertia;
        
        
        var tangent = [0,0]; 
        var nScale = [0,0];
        var relativeDot = vec2.dot(relativeVelocity, n);
        
        vec2.scale(nScale, n, relativeDot);
        vec2.sub(tangent, relativeVelocity, nScale);
        vec2.normalize(tangent, tangent);
        vec2.scale(tangent, tangent, -1);
        
        var R1CrossT = [0,0], R2CrossT = [0,0];
        vec2.cross(R1CrossT, r1, tangent);
        vec2.cross(R2CrossT, r2, tangent);
        
        var relativeDotTangent = vec2.dot(relativeVelocity, tangent);
        if(relativeDotTangent > 0)
            document.getElementById("D3").innerHTML = "WARNING: relativeDotTanget > 0";
        var jT = -(1 + newRestituion) * relativeDotTangent * newFriction;
        jT = jT / (s1.mInvMass + s2.mInvMass + R1CrossT[2] * R1CrossT[2] * s1.mInertia + R2CrossT[2] * R2CrossT[2] * s2.mInertia);
        
        //friction should less than force in normal direction
        if (jT > jN) {
            jT = jN;
        }
        
        vec2.scale(impulse, tangent, jT);
        var impScaleMass1 = [0,0], impScaleMass2 = [0,0];
        
        vec2.scale(impScaleMass1, impulse, s1.mInvMass);
        vec2.scale(impScaleMass2, impulse, s2.mInvMass);
        
        //document.getElementById("D3").innerHTML = "tan:" + tangent + "imp: "+ impulse + " s1Mass: "+ s1.mInvMass+ " s2Mass: " + s2.mInvMass + " imp1: " + impScaleMass1 + "imp2: " + impScaleMass2;
        
        vec2.sub(s1.mVelocity, s1.mVelocity, impScaleMass1);
        vec2.add(s2.mVelocity, s2.mVelocity, impScaleMass2);
        //document.getElementById("D3").innerHTML = "inertia1:" + s1.mInertia + "inertia2: "+ s2.mInertia;

        s1.mAngularVelocity -= R1CrossT[2] * jT * s1.mInertia;
        s2.mAngularVelocity += R2CrossT[2] * jT * s2.mInertia;
        //document.getElementById("D3").innerHTML = "AngVel1:" + s1.mAngularVelocity + "AngVel2: "+ s2.mAngularVelocity + " s1Mass: "+ s1.mInvMass+ " s2Mass: " + s2.mInvMass + " imp1: " + impScaleMass1 + "imp2: " + impScaleMass2;

    };
    
    var beginRelaxation = function() { 
        mRelaxationLoopCount = mRelaxationCount; 
        mHasOneCollision = true;
    };
    var continueRelaxation = function() { 
        var oneCollision = mHasOneCollision;
        mHasOneCollision = false;
        mRelaxationLoopCount = mRelaxationLoopCount - 1;
        return ((mRelaxationLoopCount > 0) && oneCollision); 
    };
    
    // Rigid Shape interactions: two game objects
    var processObjObj = function(obj1, obj2) {
        var s1 = obj1.getPhysicsComponent();
        var s2 = obj2.getPhysicsComponent();
        if (s1 === s2)
            return;
        beginRelaxation();
        while (continueRelaxation()) {
            if (s1.collided(s2, mCollisionInfo)) {
                resolveCollision(s1, s2, mCollisionInfo);
            }
        }
    };
    
    // Rigid Shape interactions: a game object and a game object set
    var processObjSet = function(obj, set) {
        var s1 = obj.getPhysicsComponent();
        var i, s2;
        beginRelaxation();
        while (continueRelaxation()) {
            for (i=0; i<set.size(); i++) {
                s2 = set.getObjectAt(i).getPhysicsComponent();
                if ((s1 !== s2) && (s1.collided(s2, mCollisionInfo))) {
                    resolveCollision(s1, s2, mCollisionInfo);
                }
            }
        }
    };
    
    // Rigid Shape interactions: two game object sets
    var processSetSet = function(set1, set2) {
        var i, j, s1, s2;
        beginRelaxation();
        while (continueRelaxation()) {
            for (i=0; i<set1.size(); i++) {
                s1 = set1.getObjectAt(i).getPhysicsComponent();
                for (j=0; j<set2.size(); j++) {
                    s2 = set2.getObjectAt(j).getPhysicsComponent();
                    if ((s1 !== s2) && (s1.collided(s2, mCollisionInfo))) {
                        resolveCollision(s1, s2, mCollisionInfo);
                    }
                }
            }
        }
    };
    
    // Rigid Shape interactions: a set against itself
    var processSelfSet = function(set) {
        var i, j, s1, s2;
        beginRelaxation();
        while (continueRelaxation()) {
            for (i=0; i<set.size(); i++) {
                s1 = set.getObjectAt(i).getPhysicsComponent();
                for (j=i+1; j<set.size(); j++) {
                    s2 = set.getObjectAt(j).getPhysicsComponent();
                    if ((s1 !== s2) && (s1.collided(s2, mCollisionInfo))) {
                        resolveCollision(s1, s2, mCollisionInfo);
                    }
                }
            }
        }
    };
    
    var getSystemtAcceleration = function() { return mSystemtAcceleration; };
    var setSystemtAcceleration = function(g) { mSystemtAcceleration = g; };
    var getRelaxationCorrectionRate = function() { return mPosCorrectionRate; };
    var setRelaxationCorrectionRate = function(r) {
        if ((r <= 0) || (r>=1)) {
            r = 0.8;
        }
        mPosCorrectionRate = r;
    };
    var getRelaxationLoopCount = function() { return mRelaxationCount; };
    var setRelaxationLoopCount = function(c) { 
        if (c <= 0)
            c = 1;
        mRelaxationCount = c; 
        mRelaxationOffset = 1/mRelaxationCount;
    };
    
    var mPublic = {
        initialize: initialize,
        resolveCollision: resolveCollision,
        beginRelaxation: beginRelaxation,
        continueRelaxation: continueRelaxation,
        getSystemtAcceleration: getSystemtAcceleration,
        setSystemtAcceleration: setSystemtAcceleration,
        getRelaxationCorrectionRate: getRelaxationCorrectionRate,
        setRelaxationCorrectionRate: setRelaxationCorrectionRate,
        getRelaxationLoopCount: getRelaxationLoopCount,
        setRelaxationLoopCount: setRelaxationLoopCount,
        processObjObj: processObjObj,
        processObjSet: processObjSet,
        processSetSet: processSetSet,
        processSelfSet: processSelfSet
    };

    return mPublic;
}());
