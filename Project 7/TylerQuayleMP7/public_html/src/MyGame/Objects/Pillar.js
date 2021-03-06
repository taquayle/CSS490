/* File: Pillar.js 
 *
 * Creates and initializes the Pillar
 * overrides the update function of GameObject to define
 * simple Dye behavior
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, GeneralObj */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Pillar(spriteTexture, x, y) {
    this.kDelta = 0.3;

    this.mPlat = new SpriteRenderable(spriteTexture);
    this.mPlat.setColor([1, 1, 1, 0]);
    this.mPlat.getXform().setPosition(x, y);
    this.mPlat.getXform().setSize(3, 12);
    this.mPlat.setElementPixelPositions(0, 64, 0, 256);
    GameObject.call(this, this.mPlat);
    
    var r = new RigidRectangle(this.getXform(), 3, 12);
    r.setMass(0);  // ensures no movements!
    r.setDrawBounds(true);
    r.setColor([0, 0, 0, 1]);
     this.setPhysicsComponent(r);
    //this.toggleDrawRenderable();
}
gEngine.Core.inheritPrototype(Pillar, GeneralObj);

Pillar.prototype.update = function () {
    GameObject.prototype.update.call(this);
};

Pillar.prototype.getWidth = function(){ var t = this.mPlat.getXform(); return t.getSize()[0];};
Pillar.prototype.getHeight = function(){ var t = this.mPlat.getXform(); return t.getSize()[1];};

Pillar.prototype.setVisible = function()       {this.setVisibility(true);};
Pillar.prototype.setInvisible = function()     {this.setVisibility(false);};