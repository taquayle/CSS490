/*
 * File: LineRenderable_BB.js
 *  
 * Renderable objects for lines
 */

/*jslint node: true, vars: true */
/*global gEngine, Renderable, LineRenderable, BoundingBox,vec2*/
/* find out more about jslint: http://www.jslint.com/help.html */

// Constructor and object definition
"use strict";  // Operate in Strict mode such that variables must be declared before used!

// p1, p2: either both there, or none
function LineRenderable_BB(bb) {
    this.lLine = new LineRenderable(bb.minX(), bb.minY(), bb.minX(), bb.maxY());
    this.tLine = new LineRenderable(bb.minX(), bb.maxY(), bb.maxX(), bb.maxY());
    this.rLine = new LineRenderable(bb.maxX(), bb.maxY(), bb.maxX(), bb.minY());
    this.bLine = new LineRenderable(bb.maxX(), bb.minY(), bb.minX(), bb.minY());
    this.setDrawVertices(false);
}
//gEngine.Core.inheritPrototype(LineRenderable_BB, Renderable);

//<editor-fold desc="Public Methods">
//**-----------------------------------------
// Public methods
//**-----------------------------------------
LineRenderable_BB.prototype.draw = function (aCamera) {
    this.lLine.draw(aCamera);
    this.tLine.draw(aCamera);
    this.rLine.draw(aCamera);
    this.bLine.draw(aCamera);
};

LineRenderable_BB.prototype.updateLine = function(bb)
{
    this.lLine.setVertices(bb.minX(), bb.minY(), bb.minX(), bb.maxY());
    this.tLine.setVertices(bb.minX(), bb.maxY(), bb.maxX(), bb.maxY());
    this.rLine.setVertices(bb.maxX(), bb.maxY(), bb.maxX(), bb.minY());
    this.bLine.setVertices(bb.maxX(), bb.minY(), bb.minX(), bb.minY());  
};

LineRenderable_BB.prototype.setDrawVertices = function (s) 
{ 
    this.lLine.setDrawVertices(s);
    this.tLine.setDrawVertices(s);
    this.rLine.setDrawVertices(s);
    this.bLine.setDrawVertices(s);
};
LineRenderable_BB.prototype.setShowLine = function (s) 
{ 
    this.lLine.setShowLine(s);
    this.tLine.setShowLine(s);
    this.rLine.setShowLine(s);
    this.bLine.setShowLine(s); 
};
