/*
 * File: Minion.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine: false, GameObject: false, ShakePosition,FontRenderable, Interpolate, PrintLine, SpriteAnimateRenderable */

/* find out more about jslint: http://www.jslint.com/help.html */
function Minion(spriteTexture, kd, cam) {
    /**************************************************************************/
    // VARABLIES - MOVEMENT
    this.kRotSpeed = .01; // .6 RadsPerSecond
    this.mXMag = kd;
    this.mYMag = kd;
    this.kTimeToSwitch = 0;
    this.kMinMoveTime = 120; // Minimums time before changing dir
    this.kMoveRange = 300;//between 0 and THIS time addes to MinMovetime
    this.kRotate = 0;
    this.xDir = 0;
    this.yDir = 0;
    this.kGas = 0;
    this.kAngle = Math.random() * 6.28;
    /**************************************************************************/
    // TOGGLES
    this.kControl = false;
    this.kFrontDir = false;
    this.kTexture = true;
    
    
    /**************************************************************************/
    // SETUP LOCATION/ANIMATION
    var x = (cam.getWCWidth()/2) * Math.random();       // Random Loc on canvas
    var y = (cam.getWCHeight()/2) * Math.random();
    this.mMinion = new SpriteAnimateRenderable(spriteTexture);
    this.mMinion.setColor([1, 0, 0, 0]);
    this.mMinion.getXform().setPosition(x, y);
    this.mMinion.getXform().setSize(12, 9.6);
    this.mMinion.setSpriteSequence(512, 0,      // first element pixel position: top-left 512 is top of image, 0 is left of image
                                    204, 164,   // widthxheight in pixels
                                    5,          // number of elements in this sequence
                                    0);         // horizontal padding in between
    this.mMinion.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateSwing);
    this.mMinion.setAnimationSpeed(30);
    this.mMinion.getXform().setRotationInRad(this.kAngle);
    GameObject.call(this, this.mMinion);
    /**************************************************************************/
    // SETUP BOUNDCIRCLE
    var boundCircle = new RigidCircle(this.getXform(), 10);
    boundCircle.findRad(12,9.6);
    boundCircle.setColor([0, 1, 0, 1]);
    boundCircle.setAngle(this.getCurrentFrontDir());
    boundCircle.setDrawBounds(true);
    this.setPhysicsComponent(boundCircle);
}

gEngine.Core.inheritPrototype(Minion, GameObject);

Minion.prototype.draw = function(mCamera)
{
    if(this.kTexture)
        this.mMinion.draw(mCamera);
    this.getPhysicsComponent().draw(mCamera);
};

Minion.prototype.update = function () 
{
    this.mMinion.updateAnimation();
    var f = this.getCurrentFrontDir();
    if(this.kControl && this.kFree)
    {
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) {
            this.moveY(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) {
            this.moveX(-1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) {
            this.moveY(-1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
            this.moveX(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Z)) {
            this.rotate(1);}
        if (gEngine.Input.isKeyPressed(gEngine.Input.keys.X)) {
            this.rotate(-1);}
    }
    else
    {
        if(this.kTimeToSwitch <= 0)
        {
            this.kRotate = Math.round(Math.random() * 2) - 1;
            this.kTimeToSwitch = Math.floor(Math.random() * this.kMoveRange)+ this.kMinMoveTime;
            this.xDir = Math.random() < 0.5 ? -1 : 1;
            this.yDir = Math.random() < 0.5 ? -1 : 1;
            this.kGas = Math.round(Math.random());
        }
        else
        {
            if(this.kFrontDir) // True: Only move to where 'front' is pointing
            {
                this.moveX(f[0] * this.kGas);
                this.moveY(f[1] * this.kGas);
            }
            else // False: Move independently of the 'front'
            {
                this.moveX(this.xDir);
                this.moveY(this.yDir);
            }
            this.rotate(this.kRotate);
            this.kTimeToSwitch--;
        }
    }
};

Minion.prototype.moveX = function(dir)
{ this.mMinion.getXform().incXPosBy(dir*this.mXMag);};

Minion.prototype.moveY = function(dir)
{ this.mMinion.getXform().incYPosBy(dir*this.mYMag);};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Minion.prototype.rotate = function(dir)
{
    var xform = this.mMinion.getXform();
    xform.incRotationByRad(dir * this.kRotSpeed);
    var t = xform.getRotationInRad(); 
    if( Math.abs(t - this.kAngle) > .5)
    {
        xform.incRotationByRad(-dir * this.kRotSpeed);
        this.kRotate = Math.round(Math.random() * 2) - 1;
    }
    else
    {
        var x = [Math.cos(t+1.57), Math.sin(t+1.57)];
        this.setCurrentFrontDir(x);
        this.getPhysicsComponent().setAngle(this.getCurrentFrontDir());
    } 
};


Minion.prototype.control = function(){this.kControl = true;
    this.getPhysicsComponent().setColor(0,1,0);};
Minion.prototype.unControl = function(){this.kControl = false;
    this.getPhysicsComponent().setColor(1,1,1);};

Minion.prototype.toggleTexture = function(){this.kTexture = !this.kTexture;};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Minion.prototype.reboundWalls = function(status)
{    
    if(status === 1 || status === 2){       // LEFT-RIGHT COLLISION
        this.xDir = -this.xDir;}
    else if(status === 4 || status === 8){  // TOP-BOTTOM COLLISION
        this.yDir = -this.yDir;}
    else{                                    // CORNER COLLISION
        this.xDir = -this.xDir;
        this.yDir = -this.yDir;}
    
};

/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Minion.prototype.isCollided = function(other)
{  
//    var temp = other.getDir();
//    if(temp[0] === 0 && temp[1] === 0)
//    {

//    }
//    else
//    {
//        this.setDir(temp);
//    }

    this.kFree = false;
};

Minion.prototype.rebound = function()
{
        this.xDir = -this.xDir;
        this.yDir = -this.yDir;
        this.moveX(this.xDir*2);
        this.moveY(this.yDir*2);
};
/******************************************************************************/
// WRITE DESC
/******************************************************************************/
Minion.prototype.notCollided = function()
{ 
    this.kFree = true;
};

Minion.prototype.getInfo = function(i)
{
    var xf = this.mMinion.getXform();
    var xD = ["left ", " ", "right "];
    var yD = [" down ", " ", " up "];
    var msg = "<td> " + i + "</td>";
    msg += "<td>(" + xf.getXPos().toPrecision(2)+ ", " + xf.getYPos().toPrecision(2) + ")</td>";
    msg += "<td>" + xf.getRotationInRad().toPrecision(3) + "</td>";
    msg += "<td>["+ (this.kAngle - .5).toPrecision(2) + ", " + (this.kAngle + .5).toPrecision(2) + "]</td>";
    msg += "<td>[" + xD[this.xDir+1] + "-" + yD[this.yDir+1] + "]</td>";
    msg += "<td>" +this.getPhysicsComponent().getRadius().toPrecision(3) + "</td>";
    return msg;
};

Minion.prototype.getDir = function()
{
  return [this.xDir, this.yDir];  
};

Minion.prototype.setDir = function(dir)
{
    this.xDir = dir[0]; this.yDir = dir[1];
    document.getElementById("Debug4").innerHTML = this.xDir + " " + this.yDir;
    
};

Minion.prototype.getRadius = function()
{
    return this.getPhysicsComponent().getRadius();
};