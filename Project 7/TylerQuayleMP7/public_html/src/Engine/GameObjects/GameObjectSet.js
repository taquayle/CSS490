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
    this.kPri = 0;
    this.kVis = false;
}

GameObjectSet.prototype.size = function () { return this.mSet.length; };

GameObjectSet.prototype.getObjectAt = function (index) {
    return this.mSet[index];
};

GameObjectSet.prototype.addToSet = function (obj) {
    this.mSet.push(obj);
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

GameObjectSet.prototype.toggleControl = function (tog) {
    for (var i = 0; i < this.mSet.length; i++) {
        this.mSet[i].uncontrol();
    }
    this.kPri += tog;
    if(this.kPri >= this.mSet.length)
        this.kPri = 0;
    else if(this.kPri < 0)
        this.kPri = this.mSet.length-1;
    this.mSet[this.kPri].control();
};

GameObjectSet.prototype.toggleVisibility = function () {
    this.kVis = !this.kVis;
    if(this.kVis)
        for (var i = 0; i < this.mSet.length; i++) {
            this.mSet[i].setVisible();}
    else
        for (var i = 0; i < this.mSet.length; i++) {
            this.mSet[i].setInvisible();}
};

GameObjectSet.prototype.returnControlledObj = function () {return this.getObjectAt(this.kPri);};

GameObjectSet.prototype.displayInfo = function()
{
    var html = "<table border='1'>";
    html += "<tr bgcolor='AAAAAA'><td> # </td><td> Pos </td>  <td> Velocity </td> <td>Ang Vel</td> <td>Inertia</td> <td> Angle </td> <td>invMass</td> </tr>";
    for(var i = 0; i < this.mSet.length; i++)
    {
        if(i === this.kPri)
            html += this.mSet[i].getInfo(i, "00ff00");
        else
            html += this.mSet[i].getInfo(i, "AAAAAA");
    };
    html += "</table>";
    document.getElementById("INFO").innerHTML = html;
};