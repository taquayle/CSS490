/* File: Circ.js 
 *
 * Creates and initializes the Circ (Dye)
 * overrides the update function of GameObject to define
 * simple Dye behavior
 */

/*jslint node: true, vars: true */
/*global gEngine, GameObject, SpriteRenderable, RigidCircle, RigidCircangle, SpriteAnimateRenderable, GeneralObj */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
Circ.kSizeRangeWidth = [3, 8];
Circ.kSizeRangeHeight = [2.4, 7.4];
function Circ(spriteTexture, atX, atY) {
    this.kXDelta = 1;
    this.kYDelta = 2.0;
    this.kControlled = false;
    this.kWidth = (Math.random() * Circ.kSizeRangeWidth[1]) + Circ.kSizeRangeWidth[0];
    this.kHeight = (Math.random() * Circ.kSizeRangeHeight[1]) + Circ.kSizeRangeHeight[0];
    this.mCirc = new SpriteAnimateRenderable(spriteTexture);
    this.mCirc.setColor([1, 1, 1, 0]);
    this.mCirc.getXform().setPosition(atX, atY);
    this.mCirc.getXform().setSize(this.kWidth, this.kHeight);
    //this.mCirc.getXform().setRotationInDegree(90);
    this.mCirc.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mCirc.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mCirc.setAnimationSpeed(30);
                                // show each element for mAnimSpeed updates

    GameObject.call(this, this.mCirc);
    var r = new RigidCircle(this.getXform(), 
                            (0.5 * Math.sqrt(this.kWidth * this.kWidth + this.kHeight * this.kHeight)));
    r.setMass(.4);  // less dense than Minions
    r.setRestitution(0.3);
    r.setColor([0, 1, 0, 1]);
    r.setDrawBounds(true);
    this.setPhysicsComponent(r);
}
gEngine.Core.inheritPrototype(Circ, GeneralObj);

Circ.prototype.update = function () {
    // must call super class update
    GameObject.prototype.update.call(this);
    // control by WASD
    if(this.kControlled){
        this.keyControl();
    }
};
