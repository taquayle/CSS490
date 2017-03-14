/*
 * File: MyGame_Utilities.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global MyGame, gEngine*/
/* find out more about jslint: http://www.jslint.com/help.html */


MyGame.prototype.setCanvasSize = function(pW, pH)
{
    document.getElementById("GLCanvas").width = (window.innerWidth*.65) * pW;
    document.getElementById("GLCanvas").height = window.innerHeight * pH;
};

MyGame.prototype.addObjectByKey= function(type)
{
    this.sNumOfObj += 1;
    var pY = this.cCamera.getWCCenter()[1] + (this.cCamera.getWCHeight()/2) -10;
    var pX = ((this.cCamera.getWCWidth()-20)/2) + 20;
    if(type==="Rectangle")
        this.oObjs.addToSet(new Rect(this.aMinionSprite, Math.random()*pX, pY));
    else if(type==="Circle")
        this.oObjs.addToSet(new Circ(this.aMinionSprite, Math.random()*pX, pY));
    else
        this.sNumOfObj -= 1;
};

MyGame.prototype.addObject = function()
{
    switch(this.sCircAndRec)
    {
        case 0:
            if(Math.random() >= .5)
                this.addObjectByKey("Circle");
            else
                this.addObjectByKey("Rectangle");
            break;
        case 1:
            this.addObjectByKey("Circle");
            break;
        case 2:
            this.addObjectByKey("Rectangle");
            break;    
    }
    this.sNumOfObj -= 1;
};


    
MyGame.prototype.buildBorder = function()
{
    var cW = this.cCamera.getWCWidth();
    var cH = this.cCamera.getWCHeight();
    var cCent = this.cCamera.getWCCenter();
    this.buildCeil(cCent, cW, cH);
    this.buildWall(cCent, cW, cH);
};

MyGame.prototype.buildCeil = function(cCent, cW, cH)
{
    var temp = new Platform(this.aPlat, 40, 50);
    var pW = temp.getWidth() / 2;
    var pH = temp.getHeight() / 2;
    
    var k = Math.ceil(cW/(pW*2));
    var startX = cCent[0] - cW/2;
    var startY = cCent[1] + cH/2;
    this.oneRow(startX, startY-pH, pW, k, 180);
    var startY = cCent[1] - cH/2;
    this.oneRow(startX, startY+pH, pW, k, 0);
};
MyGame.prototype.oneRow = function(x, y, pW, k, r)
{
    for(var i = 0; i < k; i++)
    {
        var temp = new Platform(this.aPlat, (x+pW+(pW*(i*2))), y, r);
        this.oBorder.addToSet(temp);
    }
};

MyGame.prototype.buildWall = function(cCent, cW, cH)
{
    var temp = new Pillar(this.aWall, 40, 50);
    var pW = temp.getWidth() / 2;
    var pH = temp.getHeight() / 2;
    
    var k = Math.ceil(cH/(pH*2));
    var startX = cCent[0] - cW/2;
    var startY = cCent[1] - cH/2;
    this.oneCol(startX+pW, startY, pH, k);
    var startX = cCent[0] + cW/2;
    this.oneCol(startX-pW, startY, pH, k);
};
MyGame.prototype.oneCol = function(x, y, pH, k)
{
    for(var i = 0; i < k; i++)
    {
        var temp = new Pillar(this.aWall, x,(y+pH+(pH*(i*2))));
        this.oBorder.addToSet(temp);
    }
};

MyGame.prototype.addObjectByKey= function(type)
{
    this.sNumOfObj += 1;
    var pY = this.cCamera.getWCCenter()[1] + (this.cCamera.getWCHeight()/2) -10;
    var pX = ((this.cCamera.getWCWidth()-20)/2) + 20;
    if(type==="Rectangle")
        this.oObjs.addToSet(new Rect(this.aMinionSprite, Math.random()*pX, pY));
    else if(type==="Circle")
        this.oObjs.addToSet(new Circ(this.aMinionSprite, Math.random()*pX, pY));
    else
        this.sNumOfObj -= 1;
};

MyGame.prototype.addObject = function()
{
    switch(this.sCircAndRec)
    {
        case 0:
            if(Math.random() >= .5)
                this.addObjectByKey("Circle");
            else
                this.addObjectByKey("Rectangle");
            break;
        case 1:
            this.addObjectByKey("Circle");
            break;
        case 2:
            this.addObjectByKey("Rectangle");
            break;    
    }
    this.sNumOfObj -= 1;
};

MyGame.prototype.buildBorder = function()
{
    var cW = this.cCamera.getWCWidth();
    var cH = this.cCamera.getWCHeight();
    var cCent = this.cCamera.getWCCenter();
    this.buildCeil(cCent, cW, cH);
    this.buildWall(cCent, cW, cH);
};

MyGame.prototype.buildCeil = function(cCent, cW, cH)
{
    var temp = new Platform(this.aPlat, 40, 50);
    var pW = temp.getWidth() / 2;
    var pH = temp.getHeight() / 2;
    
    var k = Math.ceil(cW/(pW*2));
    var startX = cCent[0] - cW/2;
    var startY = cCent[1] + cH/2;
    this.oneRow(startX, startY-pH, pW, k, 180);
    var startY = cCent[1] - cH/2;
    this.oneRow(startX, startY+pH, pW, k, 0);
};
MyGame.prototype.oneRow = function(x, y, pW, k, r)
{
    for(var i = 0; i < k; i++)
    {
        var temp = new Platform(this.aPlat, (x+pW+(pW*(i*2))), y, r);
        this.oBorder.addToSet(temp);
    }
};

MyGame.prototype.buildWall = function(cCent, cW, cH)
{
    var temp = new Pillar(this.aWall, 40, 50);
    var pW = temp.getWidth() / 2;
    var pH = temp.getHeight() / 2;
    
    var k = Math.ceil(cH/(pH*2));
    var startX = cCent[0] - cW/2;
    var startY = cCent[1] - cH/2;
    this.oneCol(startX+pW, startY, pH, k);
    var startX = cCent[0] + cW/2;
    this.oneCol(startX-pW, startY, pH, k);
};
MyGame.prototype.oneCol = function(x, y, pH, k)
{
    for(var i = 0; i < k; i++)
    {
        var temp = new Pillar(this.aWall, x,(y+pH+(pH*(i*2))));
        this.oBorder.addToSet(temp);
    }
};
