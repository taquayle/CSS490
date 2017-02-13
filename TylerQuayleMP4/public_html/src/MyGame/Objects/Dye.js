/*
 * File: Dye.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine: false, GameObject: false, ShakePosition,
 * SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */
function Dye(spriteTexture) {
    this.kDelta = 0.3;
    this.mXMag = this.kDelta;
    this.mYMag = this.kDelta;
    this.mIntX = new Interpolate(0, 120, .05);
    this.mIntY = new Interpolate(0, 120, .05);

    
    this.mNumCyclesLeft = this.mCycles;
    this.mShake = new ShakePosition(4.5, 6, 4, 60);
    this.mSToggle = false;
    this.mDye = new SpriteRenderable(spriteTexture);
    this.mDye.setColor([1, 1, 1, 0]);
    this.mDye.getXform().setPosition(35, 50);
    this.mDye.getXform().setSize(9, 12);
    this.mDye.setElementPixelPositions(0, 120, 0, 180);
    GameObject.call(this, this.mDye);
}
gEngine.Core.inheritPrototype(Dye, GameObject);

Dye.prototype.draw = function(mCamera)
{
   this.mRenderComponent.draw(mCamera);
    
};
Dye.prototype.update = function (mCamera) 
{
    var debug = "";
    
    if(this.mSToggle)
    {
        if(this.mShake.shakeDone())
            this.mSToggle = !this.SToggle;
            
        else
        {
            var s = this.mShake.getShakeResults();
            this.mDye.getXform().setSize(9-s[0], 12-s[1]);
        }
    }
    var xform = this.mDye.getXform();


    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) 
    {
        this.mSToggle = !this.SToggle;
        this.mShake = new ShakePosition(4.5, 6, 4, 60);
    }

    if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Middle)) {
        xform.setXPos(mCamera.mouseWCX());
        xform.setYPos(mCamera.mouseWCY());
    }

    if(mCamera.isMouseInViewport())
        this.moveToMouse(xform, mCamera);
    
    document.getElementById("debug").innerHTML = debug;
};

Dye.prototype.moveToMouse = function(xform, mCamera)
{
    // Step A: determine if reach the destination position p

        if(mCamera.mouseWCX() < xform.getXPos())
            this.moveX(xform, -1);
        else
            this.moveX(xform, 1);
    
  
        if(mCamera.mouseWCY() < xform.getYPos())
            this.moveY(xform, -1);
        else
            this.moveY(xform, 1);
    
};



/******************************************************************************/
// moveY
//  Move in the Y direction, check updated coordinate and undo if illegal
/******************************************************************************/
Dye.prototype.moveY = function (xform, dir)
{
    xform.incYPosBy((this.kDelta * dir));
};
/******************************************************************************/
// moveX
//  Move in the X direction, check updated coordinate and undo if illegal
/******************************************************************************/
Dye.prototype.moveX = function (xform, dir)
{
    xform.incXPosBy((this.kDelta * dir));
};