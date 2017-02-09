/*
 * File: Dye.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, FontRenderable*/
/* find out more about jslint: http://www.jslint.com/help.html */

function Dye(spriteTexture) {
    this.kDelta = 0.3;
    this.mXMag = this.kDelta;
    this.mYMag = this.kDelta;

    this.mCycles = 10;
    this.mOmega = 10;
    this.mShowInfo = false;
    this.mNumCyclesLeft = this.mCycles;
    
    this.mDye = new SpriteRenderable(spriteTexture);
    this.mDye.setColor([1, 1, 1, 0]);
    this.mDye.getXform().setPosition(35, 50);
    this.mDye.getXform().setSize(9, 12);
    this.mDye.setElementPixelPositions(0, 120, 0, 180);
    
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([0, 0, 0, 1]);
    this.mInfo.setTextHeight(2);
    this.mInfo.getXform().setPosition(35, 50);
    GameObject.call(this, this.mDye);
}
gEngine.Core.inheritPrototype(Dye, GameObject);

Dye.prototype.draw = function(mCamera)
{
   this.mDye.draw(mCamera);
   if(this.mShowInfo)
       this.mInfo.draw(mCamera);
};
Dye.prototype.update = function (mCamera) 
{
    if(this.mShowInfo)
        this.updateInfo();
    var xform = this.mDye.getXform();

    // MOVE UP
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) 
    {
        this.moveY(xform, 1);
    }
    
    // MOVE LEFT
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) 
    {
        this.moveX(xform, -1);
    }
    
    //  MOVE DOWN
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) 
    {
        this.moveY(xform, -1);
    }
    
    // MOVE RIGHT
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) 
    {
        this.moveX(xform, 1);
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.J)) 
    {
        this.shakeDye();
    }
    
    if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Middle)) {
        xform.setXPos(mCamera.mouseWCX());
        xform.setYPos(mCamera.mouseWCY());
    }

    if(mCamera.isMouseInViewport())
        this.moveToMouse(xform, mCamera);
};

Dye.prototype.updateInfo = function()
{
    var d = this.mDye.getXform();
    var info = "(" + d.getXPos().toPrecision(4);
    info += ", " + d.getYPos().toPrecision(4) + ")";
    this.mInfo.setText(info);
    this.mInfo.getXform().setPosition(d.getXPos() - (d.getSize()[0]/2), 
                                        d.getYPos() - (d.getSize()[1]/2));
};

Dye.prototype.moveToMouse = function(xform, mCamera)
{
    if((mCamera.mouseWCX() - xform.getXPos()) < 10 ||
            (mCamera.mouseWCY() - xform.getYPos()) < 10)
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

//Dye.prototype.shakeDye = function()
//{
//    
//};

Dye.prototype.showInfo = function() {return this.mShowInfo;};
Dye.prototype.setInfo = function(info) { this.mShowInfo = info; this.updateInfo();};
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