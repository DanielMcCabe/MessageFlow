function MessageFlow(a){this.canvas=this._getSvgCanvas(a);this.nodes=[];this.messages=[];this.nodeTitleBoxGap=this._calculateGapBetweenNodeTitleBoxes(a);null!==this.canvas&&0<a.nodeNames.length&&(this.nodes=this._createAllNodes(a))}MessageFlow.prototype._minCanvasWidth=120;MessageFlow.prototype._margin=20;MessageFlow.prototype._nodeRectWidth=80;MessageFlow.prototype._mLineSpacing=60;MessageFlow.prototype._mLineGap=60;MessageFlow.prototype._lineStartY=68;
MessageFlow.prototype._getSvgCanvas=function(a){var b=a.container;if("object"!==typeof b)if("string"===typeof b)b=document.getElementById(b);else return null;if(parseInt(b.style.width,10)<a.nodeNames.length*this._nodeRectWidth+((a.nodeNames.length-1)*this._margin+2*this._margin))return null;b.innerHTML="";return Raphael(b,parseInt(b.style.width,10),parseInt(b.style.height,10))};
MessageFlow.prototype._calculateGapBetweenNodeTitleBoxes=function(a){return(this.canvas.width-this._nodeRectWidth*a.nodeNames.length)/(a.nodeNames.length+1)};MessageFlow.prototype._createAllNodes=function(a){for(var b=[],c=a.nodeNames.length,d=1;d<=c;d++){var e=new Node(a.nodeNames[d-1],this.canvas,this.nodeTitleBoxGap,c,d);b.push(e)}return b};
MessageFlow.prototype.addMessageLine=function(a){if("undefined"===typeof this.nodes||!_isValid(a.from,a.to,this.nodes.length))return null;var b=this._getNodeLinePath(0),b=b[1][1]-b[0][2],c=b-this.messages.length*this._mLineSpacing;if(c<2*this._mLineGap){c=2*this._mLineGap-c;this.canvas.setSize(this.canvas.width,this.canvas.height+c);/msie/.test(navigator.userAgent.toLowerCase())?this.canvas.canvas.parentNode.style.height=parseInt(this.canvas.canvas.parentNode.style.height,10)+c+"px":this.canvas.canvas.parentElement.style.height=
parseInt(this.canvas.canvas.parentElement.style.height,10)+c+"px";for(var d=0;d<this.nodes.length;d++){var e=this.nodes[d].linePath;e.attr({path:"M "+e.attr("path")[0][1]+","+e.attr("path")[0][2]+" V "+(e.attr("path")[1][1]+c)});b+=c}}var b=this._getNodeLinePath(a.from-1)[0][1],g=this._getNodeLinePath(a.to-1)[0][1],c=this._lineStartY+this._mLineGap*(this.messages.length+1),d=this.canvas.path("M "+b+", "+c+" H "+g),e="start",h=8,f=g+6,k=f+" "+(c-6),f=f+" "+(c+6);a.from<a.to?(f=g-6,k=f+" "+(c-6),f=
f+" "+(c+6)):(e="end",h=-8);g=this.canvas.path("M "+(g+" "+c)+" L"+k+" L"+f+" L"+(g+" "+c)).attr("fill","black");k=null;"undefined"!=typeof a.primaryText&&null!==a.primaryText&&(k=this.canvas.text(b+h,c-12,a.primaryText).attr({"text-anchor":e,fill:"#000","font-size":13,"font-style":"bold"}));f=null;"undefined"!=typeof a.secondaryText&&null!==a.secondaryText&&(f=this.canvas.text(b+h,c+10,a.secondaryText).attr({"text-anchor":e,fill:"#666","font-size":12}));a=new Message(d,g,k,f,this.messages,a.callback,
a.callbackData,this);this.messages.push(a);return a};MessageFlow.prototype._getNodeLinePath=function(a){return this.nodes[a].linePath.attr("path")};function Message(a,b,c,d,e,g,h,f){this.line=a;this.arrow=b;this.primaryText=c;this.secondaryText=d;this.clicked=!1;this.callback=g;this.callbackData=h;this.primaryText.data("message",f);this._bindMouseEvents(this,e)}
Message.prototype._bindMouseEvents=function(a,b){null!==this.primaryText&&(this.primaryText.attr({cursor:"pointer"}),this.primaryText.click(function(c){for(c=0;c<b.length;c++)b[c].clicked=!1,b[c].primaryText.attr({fill:"black"}),b[c].secondaryText.attr({fill:"#666"}),b[c].line.attr({stroke:"black"}),b[c].arrow.attr({stroke:"black"});this.attr({fill:"blue"});a.secondaryText.attr({fill:"blue"});a.line.attr({stroke:"blue"});a.arrow.attr({stroke:"blue"});"undefined"!==typeof a.callback&&("undefined"!==
typeof a.callbackData&&null!==a.callbackData)&&(c=a.callback,c(a.callbackData));a.clicked=!0}),a.primaryText.mouseover(function(){this.attr({fill:"blue"})}),a.primaryText.mouseout(function(){a.clicked||this.attr({fill:"black"})}))};function _isValid(a,b,c){return 0>a||a>c||0>b||b>c||a==b?!1:!0}function Node(a,b,c,d,e){this.lineX=-1;this.linePath=null;this._resolveLineOffsetX(d,e,c);this._createNodeTitleBox(a,b);this._createNodeLine(b)}Node.prototype._nodeRectHeight=48;
Node.prototype._nodeRectWidth=80;Node.prototype._nodeRectWidthHalved=40;Node.prototype._margin=20;Node.prototype._lineStartY=68;Node.prototype._resolveLineOffsetX=function(a,b,c){1==a?this.lineX=this.canvas.width/2:2==a?this.lineX=this.canvas.width/3:2<a&&(this.lineX=c*b+this._nodeRectWidth*(b-1)+this._nodeRectWidthHalved)};
Node.prototype._createNodeTitleBox=function(a,b){b.rect(this.lineX-this._nodeRectWidthHalved,this._margin,this._nodeRectWidth,this._nodeRectHeight);b.text(this.lineX,this._nodeRectHeight/2+this._margin,a).attr({"text-anchor":"middle",fill:"#000","font-size":14})};Node.prototype._createNodeLine=function(a){this.linePath=a.path("M "+this.lineX+" "+this._lineStartY+" V "+(parseInt(a.height,10)-this._margin)).attr({stroke:"#aaa"})};
