/*
 * File: PrintLine.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Camera, vec2,
  FontRenderable */
PrintLine.defaultLine = 1;
PrintLine.defaultSize = 3;

function PrintLine(cam, msg, lNum, size)
{
    /**************************************************************************/
    // START: Check input validity
    if(typeof lNum === "undefined")
        lNum = PrintLine.defaultLine;
    if(typeof size === "undefined")
        size = PrintLine.defaultSize;
    if(typeof msg === "undefined")
        this.mMsg = new FontRenderable("Status MSG");
    else
        this.mMsg = new FontRenderable(msg);
    // END: check input validity
    /**************************************************************************/
    var texDim = [cam.getWCWidth(), cam.getWCHeight()];
    var texCen = cam.getWCCenter();
    var tX = texCen[0] - (texDim[0] /2) + (2*size);
    var tY = texCen[1] - (texDim[1] /2) + (size * lNum);
    

    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(tX, tY);
    this.mMsg.setTextHeight(size);

};

PrintLine.prototype.draw = function(cam){this.mMsg.draw(cam);};
PrintLine.prototype.setText = function(msg){this.mMsg.setText(msg);};
PrintLine.prototype.setColor = function(r,g,b){this.mMsg.setColor([r,g,b,1]);};
PrintLine.prototype.setColor = function(col) {this.mMsg.setColor(col);};