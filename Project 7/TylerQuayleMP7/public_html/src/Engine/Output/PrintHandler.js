/*
 * File: PrintHandler.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Camera, vec2, PrintLine
  FontRenderable */

PrintHandler.defaultSize = 3;
function PrintHandler(cam, msg, size)
{
    if(typeof size === "undefined")
        size = PrintHandler.defaultSize;
    if(typeof msg === "undefined")
        msg = "Default\nStatus Msg";
    this.kSize = size;
    this.kPrintLines = [];
    this.kMsgSplit = [];
    this.kMsg = msg;
    this.mCam = cam;
    this.mUpdate = true;
};

PrintHandler.prototype.update = function()
{
    if(this.mUpdate)
    {   
        this.mUpdate = false;
        this.kPrintLines = [];
        this.kMsgSplit = this.kMsg.split("\n");
        var l = this.kMsgSplit.length;
        for(var i = 0; i < this.kMsgSplit.length; i++){
            this.kPrintLines.push(new PrintLine(this.mCam ,this.kMsgSplit[i], (l-i) ,this.kSize));
        }
    }
};

PrintHandler.prototype.draw = function(aCam){
    for(var i = 0; i < this.kPrintLines.length; i++){
        this.kPrintLines[i].draw(aCam);}};

PrintHandler.prototype.setText = function(msg){
    this.kMsg = msg; 
    this.mUpdate = true;};