/* File: GameObjectSet.js 
 *
 * Support for working with a set of GameObjects
 */

/*jslint node: true, vars: true */
/*global  */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!


function GameObjectSet() {
    this.mSet = [];
}

GameObjectSet.prototype.size = function () { return this.mSet.length; };

GameObjectSet.prototype.getObjectAt = function (index) {
    return this.mSet[index];
};

GameObjectSet.prototype.addToSet = function (obj) {
    this.mSet.push(obj);
};

GameObjectSet.prototype.update = function () {
    var i;
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].update();
    }
};

GameObjectSet.prototype.draw = function (aCamera) {
    var i;
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].draw(aCamera);
    }
};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
GameObjectSet.prototype.switchControl = function (x) {
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].unControl();
    }
    this.mSet[x].control();
};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
GameObjectSet.prototype.changeRadius = function (x) {
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].getPhysicsComponent().changeRadius(x);
    }
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
GameObjectSet.prototype.debug = function()
{
    var msg = "";
    for (var i = 0; i < this.mSet.length; i++) {
        msg += i-1 + ": "+ this.mSet[i].kRotate + "<br>";
    }
    document.getElementById("Debug2").innerHTML = msg;
};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
GameObjectSet.prototype.boundryCheck = function(camera)
{
    var msg = "";
    var status = 0;
    for (var i = 0; i < this.mSet.length; i++) {
        status = camera.clampAtBoundaryCircle(this.mSet[i].getXform(), 0.99, this.mSet[i].getPhysicsComponent());
        if(status !== 16)
            this.mSet[i].reboundWalls(status);
        msg += status + " | ";
    }
    document.getElementById("Debug1").innerHTML = msg;
};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
GameObjectSet.prototype.detectCollision = function () {
    
    var curObj, checkObj;
    this.mCollidedObj = null;
    for (var i = 0; i < this.mSet.length; i++) {
        curObj = this.mSet[i].getPhysicsComponent();
        for(var j = 0; j < this.mSet.length; j++)
        {
            checkObj = this.mSet[j].getPhysicsComponent();
            if(i !== j)
            {
                if(curObj.collided(checkObj))
                {
                   this.mSet[i].isCollided();
                   this.mSet[j].isCollided();
                }
                else
                {
                    this.mSet[i].notCollided();
                    this.mSet[j].notCollided();
                }
            }
        }
    }
};