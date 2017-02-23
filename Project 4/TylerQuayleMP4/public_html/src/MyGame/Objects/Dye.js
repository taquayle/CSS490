/*
 * File: Dye.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine: false, GameObject: false, ShakePosition,FontRenderable, Interpolate, LineRenderable_BB,
 * SpriteRenderable: false */

/* find out more about jslint: http://www.jslint.com/help.html */
function Dye(spriteTexture) {
    this.kDelta = 0.3;
    this.mXMag = this.kDelta;
    this.mYMag = this.kDelta;
    this.mIntX = new Interpolate(35, 120, .05);
    this.mIntY = new Interpolate(50, 120, .05);

    this.mShowInfo = false;
    this.mShowBorder = true;
    this.mNumCyclesLeft = this.mCycles;
    this.mShake = new ShakePosition(4.5, 6, 4, 60);
    this.mSToggle = false;
    this.mDye = new SpriteRenderable(spriteTexture);
    this.mDye.setColor([1, 1, 1, 0]);
    this.mDye.getXform().setPosition(35, 50);
    this.mDye.getXform().setSize(9, 12);
    this.mDye.setElementPixelPositions(0, 120, 0, 180);
    
    this.mInfo = new FontRenderable("DEBUG");
    this.mInfo.setColor([1, 1, 1, 1]);
    this.mInfo.setTextHeight(2);
    this.mInfo.getXform().setPosition(35, 50);
    GameObject.call(this, this.mDye);
    var bb = this.getBBox();
    //this.border = new LineRenderable_bb(bb.minX(), bb.minY(), bb.minX(), bb.maxY());
    this.border = new LineRenderable_BB(bb);
    this.mShowBorder = false;
}
gEngine.Core.inheritPrototype(Dye, GameObject);

Dye.prototype.draw = function(mCamera)
{
   this.mDye.draw(mCamera);
   if(this.mShowInfo)
       this.mInfo.draw(mCamera);
   if(this.mShowBorder)
    this.border.draw(mCamera);
};
Dye.prototype.update = function (mCamera) 
{
    this.mIntX.updateInterpolation();
    this.mIntY.updateInterpolation();
    
    if(this.mSToggle)
    {
        if(this.mShake.shakeDone())
        {
            this.mSToggle = false;
            this.mShake = new ShakePosition(4.5, 6, 4, 60);
        }
        else
        {
            var s = this.mShake.getShakeResults();
            this.mDye.getXform().setSize(9-s[0], 12-s[1]);
        }
    }
    

    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) 
    {
        this.shake();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.B)) 
    {
        this.showBorder();
    }
    var xform = this.mDye.getXform();
    this.mIntX.setFinalValue(mCamera.mouseWCX());
    this.mIntY.setFinalValue(mCamera.mouseWCY());
    xform.setXPos(this.mIntX.getValue());
    xform.setYPos(this.mIntY.getValue());
    
    this.border.updateLine(this.getBBox());
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

Dye.prototype.showInfo = function() {return this.mShowInfo;};
Dye.prototype.setInfo = function(info) { this.mShowInfo = info; this.updateInfo();};
Dye.prototype.shake = function(){ this.mSToggle = true;};

Dye.prototype.showBorder = function(show)
{
    this.mShowBorder = show;
    this.border.setShowLine(show);
    this.border.setDrawVertices(show);
};