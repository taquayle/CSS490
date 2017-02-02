/*
 * File: Dye.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

function DyePack(spriteTexture) {
    this.kDelta = 0.3;

    this.mDye = new SpriteRenderable(spriteTexture);
    this.mDye.setColor([1, 1, 1, 0]);
    this.mDye.getXform().setPosition(35, 50);
    this.mDye.getXform().setSize(9, 12);
    this.mDye.setElementPixelPositions(0, 120, 0, 180);
    GameObject.call(this, this.mDye);
}
gEngine.Core.inheritPrototype(DyePack, GameObject);


DyePack.prototype.update = function (mCamera) 
{

    var xform = this.mDye.getXform();

    // MOVE UP
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) 
    {
        pressedY = this.moveY(xform, 1);
    }
    
    // MOVE LEFT
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) 
    {
        pressedX = this.moveX(xform, -1);
    }
    
    //  MOVE DOWN
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) 
    {
        pressedY = this.moveY(xform, -1);
    }
    
    // MOVE RIGHT
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) 
    {
        pressedX = this.moveX(xform, 1);
    }
    

    if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Middle)) {
        xform.setXPos(mCamera.mouseWCX());
        xform.setYPos(mCamera.mouseWCY());
    }

    if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left)) {

    }
    
    this.moveToMouse(xform, mCamera);
};

DyePack.prototype.moveToMouse = function(xform, mCamera)
{
    if((mCamera.mouseWCX() - xform.getXPos()) < 1 ||
            (mCamera.mouseWCX() - xform.getXPos()) > 1)
    {
        if(mCamera.mouseWCX() < xform.getXPos())
            this.moveX(xform, -1);
        else
            this.moveX(xform, 1);
    }
    
    if((mCamera.mouseWCY() - xform.getYPos()) < 1 ||
            (mCamera.mouseWCY() - xform.getYPos()) > 1)
    {
        if(mCamera.mouseWCY() < xform.getYPos())
            this.moveY(xform, -1);
        else
            this.moveY(xform, 1);
    }
};

/******************************************************************************/
// moveY
//  Move in the Y direction, check updated coordinate and undo if illegal
/******************************************************************************/
DyePack.prototype.moveY = function (xform, dir)
{
    xform.incYPosBy((this.kDelta * dir));
};
/******************************************************************************/
// moveX
//  Move in the X direction, check updated coordinate and undo if illegal
/******************************************************************************/
DyePack.prototype.moveX = function (xform, dir)
{
    xform.incXPosBy((this.kDelta * dir));
};