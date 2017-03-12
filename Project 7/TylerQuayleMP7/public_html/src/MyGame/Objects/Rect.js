/* File: Rect.js 
 *
 * Creates and initializes the Rect (Dye)
 * overrides the update function of GameObject to define
 * simple Dye behavior
 */

/*jslint node: true, vars: true */
/*global gEngine, GameObject, SpriteRenderable, RigidCircle, RigidRectangle, SpriteAnimateRenderable, GeneralObj */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
Rect.kSizeRangeWidth = [3, 8];
Rect.kSizeRangeHeight = [2.4, 7.4];
function Rect(spriteTexture, atX, atY) {
    this.kXDelta = 1;
    this.kYDelta = 2.0;
    this.kControlled = false;
    this.kWidth = (Math.random() * Rect.kSizeRangeWidth[1]) + Rect.kSizeRangeWidth[0];
    this.kHeight = (Math.random() * Rect.kSizeRangeHeight[1]) + Rect.kSizeRangeHeight[0];
    this.mRect = new SpriteAnimateRenderable(spriteTexture);
    this.mRect.setColor([1, 1, 1, 0]);
    this.mRect.getXform().setPosition(atX, atY);
    this.mRect.getXform().setSize(this.kWidth, this.kHeight);
    //this.mRect.getXform().setRotationInDegree(90);
    this.mRect.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mRect.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mRect.setAnimationSpeed(30);
                                // show each element for mAnimSpeed updates

    GameObject.call(this, this.mRect);
    var r = new RigidRectangle(this.getXform(), this.kWidth, this.kHeight);
    r.setMass(.01);  // less dense than Minions
    r.setRestitution(0.2);
    r.setColor([0, 1, 0, 1]);
    r.setDrawBounds(true);
    this.setPhysicsComponent(r);
}
gEngine.Core.inheritPrototype(Rect, GeneralObj);

Rect.prototype.update = function () {
    // must call super class update
    GameObject.prototype.update.call(this);
    // control by WASD
    if(this.kControlled){
        this.keyControl();
    }
};