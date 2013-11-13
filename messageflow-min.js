(function(n){function e(){this.messageLines=[];this.activeMessageLine;this.nodes=[];this.container;this.canvas;this.messageSpaceRemaining}function k(){this.lineOffsetX;this.linePath;this.style={lineColor:"#aaa",boxBorderColor:"#000",fontSize:"14",textColor:"#000"}}function g(){this.linePath;this.arrowPath;this.primaryText;this.secondaryText;this.selectableArea;this.callbackFunction;this.lineType="expected"}var l={expected:{defaultLine:{lineStyle:"stroke-dasharray",lineColor:"black",primaryTextColor:"black",
secondaryTextColor:"#666"},hover:{lineStyle:"stroke-dasharray",lineColor:"blue",primaryTextColor:"blue",secondaryTextColor:"blue"},active:{lineStyle:"stroke-dasharray",lineColor:"blue",primaryTextColor:"blue",secondaryTextColor:"blue"}},received:{defaultLine:{lineStyle:"stroke",lineColor:"#008B00",primaryTextColor:"#008B00",secondaryTextColor:"#008B00"},hover:{lineStyle:"stroke",lineColor:"#22AD22",primaryTextColor:"#22AD22",secondaryTextColor:"#22AD22"},active:{lineStyle:"stroke",lineColor:"#33BE33",
primaryTextColor:"#33BE33",secondaryTextColor:"#33BE33"}},unexpected:{defaultLine:{lineStyle:"stroke",lineColor:"#D2691E",primaryTextColor:"#D2691E",secondaryTextColor:"#D2691E"},hover:{lineStyle:"stroke",lineColor:"#EE7621",primaryTextColor:"#EE7621",secondaryTextColor:"#EE7621"},active:{lineStyle:"stroke",lineColor:"#EE7621",primaryTextColor:"#EE7621",secondaryTextColor:"#EE7621"}},timeout:{defaultLine:{lineStyle:"stroke-dasharray",lineColor:"#D2691E",primaryTextColor:"#D2691E",secondaryTextColor:"#D2691E"},
hover:{lineStyle:"stroke-dasharray",lineColor:"#EE7621",primaryTextColor:"#EE7621",secondaryTextColor:"#EE7621"},active:{lineStyle:"stroke-dasharray",lineColor:"#EE7621",primaryTextColor:"#EE7621",secondaryTextColor:"#EE7621"}}},m=[];e.prototype.checkArgumentsAreValid=function(a){var b;if(!a)throw{name:"Invalid argument exception",message:"No MessageFlow construction parameters specified."};if(!a.container)throw{name:"Invalid argument exception",message:"No container specified in MessageFlow construction parameters."};
if("string"!==typeof a.container&&"object"!==typeof a.container)throw{name:"Invalid argument exception",message:"Invalid container type specified in MessageFlow construction parameters. Valid types: String or Object."};if(!a.nodeNames||0==a.nodeNames.length)throw{name:"Invalid argument exception",message:"No nodes specified in MessageFlow construction parameters."};for(b=0;b<a.nodeNames.length;b++)if("string"!==typeof a.nodeNames[b])throw{name:"Invalid argument exception",message:"Node specified in MessageFlow construction parameters is not a string. nodeName index:"+
b};};e.prototype.constructDiagram=function(a){this.checkArgumentsAreValid(a);this.getSvgCanvas(a.container,a.nodeNames);this.messageSpaceRemaining=parseInt(this.container.style.height,10)-68-20;this.constructNodes(a.nodeNames);return this};e.prototype.getSvgCanvas=function(a,b){var c;"object"===typeof a?this.container=a:"string"===typeof a&&(this.container=document.getElementById(a));c=parseInt(this.container.style.width,10);if(c<80*b.length+(20*(b.length-1)+40))throw{name:"Display exception",message:"DOM Container not wide enough to display all specified nodes"};
this.container.innerHTML="";this.canvas=Raphael(this.container,c,parseInt(this.container.style.height,10))};e.prototype.constructNodes=function(a){var b,c=this.getBoxGap(a.length),d=c;for(b=0;b<a.length;b++)this.nodes.push((new k).construct(this.canvas,a[b],d)),d+=c+80};e.prototype.getBoxGap=function(a){return(this.canvas.width-80*a)/(a+1)};e.prototype.stretchCanvasToFitNewMessageLine=function(){var a,b;if(120>this.messageSpaceRemaining){a=120-this.messageSpaceRemaining;this.canvas.setSize(this.canvas.width,
this.canvas.height+a);this.container.style.height=parseInt(this.container.style.height,10)+a+"px";for(b=0;b<this.nodes.length;b++){var c=this.nodes[b].linePath;c.attr({path:"M "+c.attr("path")[0][1]+","+c.attr("path")[0][2]+" V "+(c.attr("path")[1][1]+a)})}this.messageSpaceRemaining+=a-60}else this.messageSpaceRemaining-=60};k.prototype.construct=function(a,b,c){this.lineOffsetX=c+40;this.constructNodeTitleBox(a,c,b);this.constructNodeLine(a);return this};k.prototype.constructNodeTitleBox=function(a,
b,c){a.rect(b,20,80,48).attr({stroke:this.style.boxBorderColor});a.text(this.lineOffsetX,44,c).attr({"text-anchor":"middle",fill:this.style.textColor,"font-size":this.style.fontSize})};k.prototype.constructNodeLine=function(a){this.linePath=a.path("M "+this.lineOffsetX+" 68 V "+(parseInt(a.height,10)-20)).attr({stroke:this.style.lineColor})};g.prototype.checkArgumentsAreValid=function(a,b){if(!a)throw{name:"Invalid argument exception",message:"No message line parameters provided."};if(!a.from||!a.to||
!a.primaryText)throw{name:"Invalid argument exception",message:"Insufficient message line parameters provided."};if(0>a.from||a.from>b||0>a.to||a.to>b||a.from==a.to)throw{name:"Invalid argument exception",message:"Invalid message line range (from <-> to)."};if(a.callback&&"function"!==typeof a.callback)throw{name:"Invalid argument exception",message:"Invalid callback object, must be a function."};if(a.lineType&&"expected"!==a.lineType&&"received"!==a.lineType&&"unexpected"!==a.lineType&&"timeout"!==
a.lineType)throw{name:"Invalid argument exception",message:"Invalid argument lineStyle."};};g.prototype.construct=function(a,b,c,d,f){var g="start",e=8,h=d+6,k=h+" "+(f-6),h=h+" "+(f+6);b.lineType&&(this.lineType=b.lineType);c<d?(h=d-6,k=h+" "+(f-6),h=h+" "+(f+6)):(g="end",e=-8);this.arrowPath=a.path("M "+d+" "+f+" L"+k+" L"+h+" L"+(d+" "+f));this.linePath=a.path("M "+c+", "+f+" H "+d);this.primaryText=a.text(c+e,f-12,b.primaryText).attr({"text-anchor":g,"font-size":13,"font-style":"bold"});b.secondaryText&&
"string"===typeof b.secondaryText&&(this.secondaryText=a.text(c+e,f+10,b.secondaryText).attr({"text-anchor":g,"font-size":12}));this.selectableArea=a.rect(Math.min(c,d),f-20,Math.abs(d-c),40).attr({stroke:"black","stroke-opacity":0,fill:"black","fill-opacity":0});this.setDefaultStyle();this.callbackFunction=b.callback;return this};g.prototype.bindMouseEvents=function(a){var b=this;this.selectableArea.attr({cursor:"pointer"});this.selectableArea.click(function(c){a.activeMessageLine&&a.activeMessageLine.setDefaultStyle();
b.setActiveStyle();a.activeMessageLine=b;b.callbackFunction&&b.callbackFunction()});this.selectableArea.hover(function(){b!==a.activeMessageLine&&b.setHoverStyle()},function(){b!==a.activeMessageLine&&b.setDefaultStyle()})};g.prototype.setStyle=function(a){var b={stroke:a.lineColor};"stroke"===a.lineStyle?b["stroke-width"]=2:"stroke-dasharray"===a.lineStyle&&(b[a.lineStyle]="--");this.linePath.attr(b);this.arrowPath.attr({fill:a.lineColor,stroke:a.lineColor});this.primaryText.attr({fill:a.primaryTextColor});
this.secondaryText&&this.secondaryText.attr({fill:a.secondaryTextColor})};g.prototype.setDefaultStyle=function(){this.setStyle(l[this.lineType].defaultLine)};g.prototype.setHoverStyle=function(){this.setStyle(l[this.lineType].hover)};g.prototype.setActiveStyle=function(){this.setStyle(l[this.lineType].active)};n.MessageFlow=function(a){this.id=m.push((new e).constructDiagram(a))-1};MessageFlow.prototype.addMessageLine=function(a){var b=m[this.id],c=new g,d,f,e;c.checkArgumentsAreValid(a);b.stretchCanvasToFitNewMessageLine();
d=b.nodes[a.from-1].lineOffsetX;f=b.nodes[a.to-1].lineOffsetX;e=parseInt(b.canvas.height,10)-20-b.messageSpaceRemaining;c.construct(b.canvas,a,d,f,e);c.bindMouseEvents(b);a.lineStyle&&(b.activeMessageLine=c);return b.messageLines.push(c)-1}})(window);
