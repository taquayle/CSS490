/* File: GameObjectSet.js 
 *
 * Support for working with a set of GameObjects
 */

/*jslint node: true, vars: true */
/*global, BoundingBox  */
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
    var i, obj, x;
    for (i = 0; i < this.mSet.length; i++) {
        obj = this.mSet[i];
        x = obj.getPosition()[0];
        if (obj.hasExpired() || x > camRSide || obj.getSpeed() <= 0 ) {
            this.removeFromSet(obj);
        }
    }
};

GameObjectSet.prototype.checkPatrols = function(aCamera)
{
    this.checkPacks(aCamera);
    for (var i = 0; i < this.mSet.length; i++) {
        if( this.mSet[i].getWingAlpha()[0] >= 1 || 
            this.mSet[i].getWingAlpha()[1] >= 1)
        {
            this.removeFromSet(this.mSet[i]);
        }
    }
};

GameObjectSet.prototype.slowDown = function()
{
    var i, obj;
    for (i = 0; i < this.mSet.length; i++) {
        obj = this.mSet[i];
        obj.slowDown();}
};

GameObjectSet.prototype.speedUp = function()
{
    var i, obj;
    for (i = 0; i < this.mSet.length; i++) {
        obj = this.mSet[i];
        obj.speedUp();}
};

GameObjectSet.prototype.setInfo = function(info)
{
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].setInfo(info);
    }
};

GameObjectSet.prototype.updateInfo = function()
{
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].updateInfo();
    }
};

GameObjectSet.prototype.triggerShake = function()
{
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].shake();
    }
};

GameObjectSet.prototype.checkPatrolBounds = function(camera)
{
    for (var i = 0; i < this.mSet.length; i++) {
        camera.clampAtBoundary(this.mSet[i].getXform(), 0.95);
    }
};

GameObjectSet.prototype.checkForCollide = function(toCheck)
{
    var inBox;
     for (var i = 0; i < this.mSet.length; i++) {
         for(var j = 0; j < toCheck.size(); j++)
         {
            inBox = toCheck.getObjectAt(j);
            if(this.mSet[i].checkForBigBoxCollide(inBox.getBBox()))
            {
                toCheck.slowDown();
                if(this.mSet[i].checkForCollide(inBox.getBBox()))
                {
                    toCheck.removeFromSet(inBox);
                }
            }
        }
    }
};

GameObjectSet.prototype.checkForDyeCollide = function(dye)
{
     for (var i = 0; i < this.mSet.length; i++) 
        if(this.mSet[i].checkForDyeCollide(dye.getBBox()))
            dye.shake();
};

GameObjectSet.prototype.showBorder = function()
{
     for (var i = 0; i < this.mSet.length; i++)
         this.mSet[i].showBorder();
};