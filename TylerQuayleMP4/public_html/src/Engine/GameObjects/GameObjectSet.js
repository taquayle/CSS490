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
GameObjectSet.prototype.removeFromSet = function (obj) {
    var index = this.mSet.indexOf(obj);
    if (index > -1)
        this.mSet.splice(index, 1);
};
GameObjectSet.prototype.checkPacks = function(aCamera)
{
    var camRSide = aCamera.getWCCenter()[0] + (aCamera.getWCWidth()/2);
    //var debug = " " + camRSide + " <br> "; 
    var i, obj, x;
    for (i = 0; i < this.mSet.length; i++) {
        obj = this.mSet[i];
        x = obj.getPosition()[0];
        //debug += i +  x + "<br>";
        if (obj.hasExpired() || x > camRSide) {
            this.removeFromSet(obj);
        }
//        if(x > camRSide)
//        {
//            this.removeFromSet(obj);
//        }
    }
    //document.getElementById("debug").innerHTML = debug;
};
