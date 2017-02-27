/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*jslint node: true, vars: true, white: true */
/*global vec2, CollisionInfo */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

/**
 * Static refrence to gEngine
 * @type gEngine
 */
var gEngine = gEngine || { };
    // initialize the variable while ensuring it is not redefined

/**
 * Default Constructor<p>
 * Physics engine supporting projection and impulse collision resolution. <p>
 * @class gEngine.Physics
 * @type gEngine.Physics
 */
gEngine.Physics = (function () {

    var mSystemtAcceleration = [0, -20];        // system-wide default acceleration
    
    var getSystemtAcceleration = function() { return mSystemtAcceleration; };
    
    var processCollision = function(set) {
        var i = 0, j;
        for (i = 0; i<set.size(); i++) {
            var one = set.getObjectAt(i).getRigidBody();
            for (j = i+1; j<set.size(); j++) {
                var g = set.getObjectAt(j).getRigidBody();
                if (one.boundTest(g)) {
                    one.flipVelocity();
                    g.flipVelocity();
                }
            }
        }
    };
    
    var mPublic = {
        getSystemAcceleration: getSystemtAcceleration,
        processCollision: processCollision
    };
    return mPublic;
}());