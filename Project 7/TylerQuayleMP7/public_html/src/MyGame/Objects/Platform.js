/* File: Platform.js 
 *
 * Creates and initializes the Platform
 * overrides the update function of GameObject to define
 * simple Dye behavior
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, WASDObj */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Platform(spriteTexture, x, y, rot) {
    this.kDelta = 0.3;
    if(rot === "undefined")
        rot = 0;
    this.mPlat = new SpriteRenderable(spriteTexture);
    this.mPlat.setColor([1, 1, 1, 0]);
    this.mPlat.getXform().setPosition(x, y);
    this.mPlat.getXform().setSize(30, 3.75);
    this.mPlat.getXform().setRotationInDegree(rot);
    this.mPlat.setElementPixelPositions(0, 512, 0, 64);
    GameObject.call(this, this.mPlat);
    
    var r = new RigidRectangle(this.getXform(), 30, 3.75);
    r.setMass(0);  // ensures no movements!
    r.setDrawBounds(true);
    r.setColor([0, 0, 0, 1]);
    this.setPhysicsComponent(r);
    //this.toggleDrawRenderable();
}
gEngine.Core.inheritPrototype(Platform, WASDObj);

Platform.prototype.update = function () {
    GameObject.prototype.update.call(this);
};

Platform.prototype.getWidth = function(){ var t = this.mPlat.getXform(); return t.getSize()[0];};
Platform.prototype.getHeight = function(){ var t = this.mPlat.getXform(); return t.getSize()[1];};