/* File: Target.js 
 *
 * Creates and initializes the Target
 * overrides the update function of GameObject to define
 * simple Dye behavior
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, GeneralObj */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Target(spriteTexture, x, y) {
    this.kDelta = 0.3;
    this.kMimicPos = null;
    this.kMimicWid = null;
    this.kMimicHei = null;
    this.mPlat = new SpriteRenderable(spriteTexture);
    this.mPlat.setColor([1, 1, 1, 0]);
    this.mPlat.getXform().setPosition(x, y);
    this.mPlat.getXform().setSize(3, 12);
    this.mPlat.setElementPixelPositions(0, 256, 0, 256);
    GameObject.call(this, this.mPlat);
    var r = new RigidRectangle(this.getXform(), 30, 3.75);
    r.setDrawBounds(false);
    this.setPhysicsComponent(r);
}
gEngine.Core.inheritPrototype(Target, GeneralObj);

Target.prototype.update = function (mControl) {
    GameObject.prototype.update.call(this);
    this.kMimicPos = mControl.getPos();
    this.kMimicHei = mControl.getHeight();
    this.kMimicWid = mControl.getWidth();
    this.kMimicRot = mControl.getRot();
    this.mPlat.getXform().setPosition(this.kMimicPos[0], this.kMimicPos[1]);
    this.mPlat.getXform().setSize(this.kMimicWid, this.kMimicHei);
    this.mPlat.getXform().setRotationInRad(this.kMimicRot);
};