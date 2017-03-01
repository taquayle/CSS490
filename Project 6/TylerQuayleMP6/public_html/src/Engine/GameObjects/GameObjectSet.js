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
    this.kPri = 0;              // The currently controled object
    this.kCollisionRecord = []; // Keeps track of which objects have collided
}

GameObjectSet.prototype.size = function () { return this.mSet.length; };

GameObjectSet.prototype.getObjectAt = function (index) {
    return this.mSet[index];
};

GameObjectSet.prototype.addToSet = function (obj) {
    this.mSet.push(obj);
    this.setColArray();
    this.mSet[this.mSet.length-1].kID = this.mSet.length-1;
    this.updateLineCounts();
};

/******************************************************************************/
// Update each objects table of max possible collision lines
/******************************************************************************/
GameObjectSet.prototype.updateLineCounts = function()
{
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].updateLineRecords(this.mSet.length);
    }
};
/******************************************************************************/
// Set the length of the collision array, used to keep track of which collisions
// have occured
/******************************************************************************/
GameObjectSet.prototype.setColArray = function()
{
    this.kCollisionRecord = new Array(this.mSet.length).fill(false);
};
GameObjectSet.prototype.update = function () {
    var i;
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].update();
    }
};

GameObjectSet.prototype.update = function (aCamera) {
    var i;
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].update(aCamera);
    }
};

GameObjectSet.prototype.draw = function (aCamera) {
    var i;
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].draw(aCamera);
    }
};
GameObjectSet.prototype.toggleMove = function(){   
    this.mSet[this.kPri].toggleVelocity();};

GameObjectSet.prototype.toggleAllMove = function (){
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].toggleVelocity();}
};
/******************************************************************************/
// Switch which object is being controled
/******************************************************************************/
GameObjectSet.prototype.switchControl = function (x) {
    this.kPri += x;
    if(this.kPri < 0){ // Check if
      this.kPri = this.mSet.length-1;}
    else if(this.kPri >= this.mSet.length){
      this.kPri = 0;}
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].unControl();
    }
    this.mSet[this.kPri].control();
};
/******************************************************************************/
// Increase or decrease the radius of the bounding circle of kPri by kD. Do not
//  allow the radius to be negative, by using Math.abs();
/******************************************************************************/
GameObjectSet.prototype.changeRadius = function (kD) {
        var r = this.mSet[this.kPri].getRigidBody().getBoundRadius();
        this.mSet[this.kPri].getRigidBody().setBoundRadius(Math.abs(r+kD));
};

GameObjectSet.prototype.changeAllRadius = function (kD){
    for (var i = 0; i < this.mSet.length; i++) {
        var r = this.mSet[i].getRigidBody().getBoundRadius();
        this.mSet[i].getRigidBody().setBoundRadius(Math.abs(r+kD));}
};
/******************************************************************************/
// Used to display information of the game ojects
/******************************************************************************/
GameObjectSet.prototype.debug = function()
{
    var w = window.innerWidth *.33;
    var cW = [w*.1, w*.2, w*.4, w*.1, w*.2];
    var msg = "<table bgcolor='#BBBBBB' width = '"+ w +"'style='float: right' border='1'>";
    msg += " <col width='"+ cW[0] +"'><col width='"+ cW[1] +"'><col width='"+ cW[2] +"'><col width='"+ cW[3] +"'>"+"<col width='"+ cW[4] +"'>";
    msg += "<tr  align='center'> <td>#</td> <td>Hit</td> <td>pos</td> <td>Radius</td> <td>Lines</td> </tr>";
    for (var i = 0; i < this.mSet.length; i++) {
        if(i === this.kPri)
            msg += "<tr bgcolor='#00FF00' align='center'>"+this.mSet[i].getColInfo(i) + "</tr>";
        else
            msg += "<tr  align='center'>" + this.mSet[i].getColInfo(i) + "</tr>";
    }
    msg += "</table>";
    document.getElementById("D1").innerHTML = msg;
};

/******************************************************************************/
// Clear the html of "D1", which is used to display info about circles. This is
// never called in code. Used for debugging purposes
/******************************************************************************/
GameObjectSet.prototype.clear = function()
{
    document.getElementById("D1").innerHTML = "";
};

/******************************************************************************/
// Check if any of the boundry circles have impacted on the boundries
/******************************************************************************/
GameObjectSet.prototype.boundryCheck = function(camera)
{
    var status = 0; // Status for detecting collision. 16 means inside (legal)
    for (var i = 0; i < this.mSet.length; i++) {
        status = camera.clampAtBoundaryCircle(this.mSet[i].getXform(), 0.99, this.mSet[i].getRigidBody());
        if(status !== 16) // If status != 16 then circle is touching >=1 wall
            this.mSet[i].reboundWalls(status);
    }
};
/******************************************************************************/
// Detect collision between boundry circles, runs in Nsquared. If a collision
// occurs
/******************************************************************************/
GameObjectSet.prototype.detectCollision = function () {
    this.kCollisionRecord.fill(false);  // Reset the collision record
    var curObj, checkObj;               // Variables for the objects 
    for (var i = 0; i < this.mSet.length; i++)
    {
        curObj = this.mSet[i].getRigidBody();
        for(var j = 0; j < this.mSet.length; j++)
        {
            checkObj = this.mSet[j].getRigidBody();
            if(i !== j) // Skip checking itself
            {
                if(curObj.collided(checkObj)) // Check for collision
                {
                    this.mSet[i].addLine(this.mSet[j]); // Draw the line
                    this.kCollisionRecord[i] = true;
                    this.kCollisionRecord[j] = true;
                }
                else // Clear the line corresponding to the other circle
                    this.mSet[i].clearLine(this.mSet[j]);
            }
        }
        // Set the status of each circle
        this.mSet[i].kCollide = this.kCollisionRecord[i];
    }
};


