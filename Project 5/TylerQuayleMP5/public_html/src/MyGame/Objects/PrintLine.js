/*
 * File: PrintLine.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine: false, GameObject: false, ShakePosition,FontRenderable, Interpolate, LineRenderable_BB,
 * SpriteRenderable: false */

function PrintLine(cam, size, lNum, msg)
{
    var texDim = cam.getDimensions();
    var texCen = cam.getWCCenter();
    var tX = texCen[0] - (texDim[0] /2) + size;
    var tY = texCen[1] - (texDim[1] /2) + (size * lNum);
    this.mMsg = new FontRenderable(msg);
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(tX, tY);
    this.mMsg.setTextHeight(size);
    
};

PrintLine.prototype.draw = function(cam)
{
    this.mMsg.draw(cam);
};

PrintLine.prototype.setText = function(msg){this.mMsg.setText(msg);};