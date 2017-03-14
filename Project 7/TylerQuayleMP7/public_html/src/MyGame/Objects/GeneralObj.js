/* File: WASD_Obj.js
 *
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function GeneralObj() {
}
gEngine.Core.inheritPrototype(GeneralObj, GameObject);

GeneralObj.prototype.keyControl = function () {
        var v = this.getPhysicsComponent().getVelocity();
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) {
            v[1] += this.kYDelta;
        }
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) {
            v[1] -= this.kYDelta;
        }
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) {
            v[0] -= this.kXDelta;
        }
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
            v[0] += this.kXDelta;
        }
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
            v[1] += this.kYDelta * 25;
        }
};

GeneralObj.prototype.control = function()     {this.kControlled = true;};
GeneralObj.prototype.uncontrol = function()   {this.kControlled = false;};

GeneralObj.prototype.setVisible = function()       {this.setVisibility(true);};
GeneralObj.prototype.setInvisible = function()     {this.setVisibility(false);};

GeneralObj.prototype.getWidth = function(){ return this.getXform().getSize()[0];};
GeneralObj.prototype.getHeight = function(){ return this.getXform().getSize()[1];};

GeneralObj.prototype.getPos = function(){ return this.getXform().getPosition();};
GeneralObj.prototype.getRot = function(){ return this.getXform().getRotationInRad();};

GeneralObj.prototype.getInfo = function(i, color){
    var vel = this.getPhysicsComponent(); 
    var info = "<tr bgcolor='#" + color + "'>";
    info += "<td>" + i + "</td>";
    info += "<td>" + Math.round(this.getPos()[0]) + ", "+ Math.round(this.getPos()[1]) + "</td>";
    info += "<td>" + Math.round(vel.getVelocity()[0]) + ", "+ Math.round(vel.getVelocity()[1]) + "</td>";
    info += "<td>" + vel.getAngularVelocity().toPrecision(3) + "</td>";
    info += "<td>" + vel.getInertia().toPrecision(3) + "</td>";
    info += "<td>" + vel.getAngle().toPrecision(3) + "</td>";
    info += "<td>" + vel.getInvMass().toPrecision(3) + "</td>";
    info += "</tr>";
    return info;
};