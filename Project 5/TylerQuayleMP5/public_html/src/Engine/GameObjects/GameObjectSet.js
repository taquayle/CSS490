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
// Switch which object is being conroled
/******************************************************************************/
GameObjectSet.prototype.switchControl = function (x) {
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].unControl();
    }
    this.mSet[x].control();
};
/******************************************************************************/
// Increase or decrease the radius of the bounding circles
/******************************************************************************/
GameObjectSet.prototype.changeRadius = function (x) {
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].getPhysicsComponent().changeRadius(x);
    }
};

/******************************************************************************/
// Used to display information of the game ojects
/******************************************************************************/
GameObjectSet.prototype.debug = function(sel)
{
    var msg = "<table bgcolor='#BBBBBB' width='600' style='float: center' border='1'>";
    msg += " <col width='10'><col width='130'><col width='130'><col width='130'><col width='130'>";
    msg += "<tr><td>#</td> <td>Pos</td><td>Angle</td><td>AngleBounds</td><td>Direction</td><td>CircleRadius</td></tr>";
    for (var i = 0; i < this.mSet.length; i++) {
        if(i === sel)
            msg += "<tr bgcolor='#00FF00'>"+this.mSet[i].getInfo(i) + "</tr>";
        else
            msg += "<tr>" + this.mSet[i].getInfo(i) + "</tr>";
    }
    msg += "</table>";
    document.getElementById("Debug1").innerHTML = msg;
};
GameObjectSet.prototype.clear = function()
{
    document.getElementById("Debug1").innerHTML = "";
};
/******************************************************************************/
// Check if any of the boundry circles have impacted on the boundries
/******************************************************************************/
GameObjectSet.prototype.boundryCheck = function(camera)
{
    var status = 0;
    for (var i = 0; i < this.mSet.length; i++) {
        status = camera.clampAtBoundaryCircle(this.mSet[i].getXform(), 0.99, this.mSet[i].getPhysicsComponent());
        if(status !== 16)
            this.mSet[i].reboundWalls(status);
    }
};
/******************************************************************************/
// Detect collision between boundry circles
/******************************************************************************/
GameObjectSet.prototype.detectCollision = function () {
    
    var curObj, checkObj;
    var status = false;
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
                    if(i === 0)
                        this.mSet[j].rebound();
                    else if(j === 0)
                        this.mSet[i].rebound();
                    else
                    {
                        this.mSet[i].rebound();
                        this.mSet[j].rebound();
                    }
                   this.mSet[i].isCollided(this.mSet[j]);
                   this.mSet[j].isCollided(this.mSet[i]);
                   status = true;
                }
                else
                {
                    this.mSet[i].notCollided();
                    this.mSet[j].notCollided();
                }
            }
        }
    }
    return status;
};

/******************************************************************************/
// Toggle whether or not to show textures
/******************************************************************************/
GameObjectSet.prototype.toggleTexture = function()
{
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].toggleTexture();
    }
};

GameObjectSet.prototype.switchVelocity = function(i, j)
{
    var tempI = this.mSet[i].getDir();
    var tempJ = this.mSet[j].getDir();
    document.getElementById("Debug3").innerHTML = tempI + " " + tempJ;
    this.mSet[i].setDir(tempJ);
    this.mSet[j].setDir(tempI);
};