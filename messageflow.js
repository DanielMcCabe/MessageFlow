/* Message Flow - Version 1.1 - JavaScript library for displaying a dynamic and interactive sequence of messages.
 * 
 * Copyright (c) 2013 Daniel McCabe
 * License: Licensed under the MIT license.
 * 
 * Dependency : Raphael - v2.1.0 - JavaScript Vector Library
 *              By Dmitry Baranovskiy (http://raphaeljs.com)
 *              Licensed under the MIT license.
 * 
 * --------------------------------------------------------------
 * 
 * Example usage:
 *
 *   // Create the diagram and draw the nodes/columns
 *   var mFlow = new MessageFlow({container:"container", nodeNames:["Node 1", "Node 2", "Node 3", "Node 4"]});
 *   
 *   // or using a reference to the DOM element..
 *   var obj = document.getElementById("container");
 *   var mFlow = new MessageFlow({container:obj, nodeNames:["Node 1", "Node 2", "Node 3", "Node 4"]});
 *   
 *   // Add a message line
 *   mFlow.addMessageLine({from : 1,
 *                           to : 2,
 *                  primaryText : "Message one",
 *                secondaryText : "16:12:00",
 *                     callback : someFunction });
 */ 


/*
    MessageFlow class:
        state:     the SVG canvas, the array of created nodes, and the array of generated messages
        behaviour: creation of canvas and nodes
*/
(function(glob) {

	// Constants
	var NODE_RECT_HEIGHT = 48;
	var NODE_RECT_WIDTH = 80;
	var HALF_NODE_RECT_WIDTH = 40;
	var MARGIN = 20;
	var NODE_LINE_START_Y = 68;
	var NODE_TEXT_START_Y = MARGIN + (NODE_RECT_HEIGHT / 2);
	var MESSAGE_LINE_GAP = 60;
	var SPACE_REQUIRED_FOR_NEW_MESSAGE_LINE = MESSAGE_LINE_GAP * 2;
	
    var LINE_STYLES = { "expected" :   { "defaultLine" : { lineStyle : "stroke-dasharray",
                                                           lineColor : "black",
                                                           primaryTextColor : "black",
                                                           secondaryTextColor : "#666" },

                                         "hover" :  { lineStyle : "stroke-dasharray",
                                                      lineColor : "blue",
                                                      primaryTextColor : "blue",
                                                      secondaryTextColor : "blue" },

                                         "active" : { lineStyle : "stroke-dasharray",
                                                      lineColor : "blue",
                                                      primaryTextColor : "blue",
                                                      secondaryTextColor : "blue" }
                                       },

                        "received" :   { "defaultLine" : { lineStyle : "stroke",
                                                           lineColor : "#008B00",
                                                           primaryTextColor : "#008B00",
                                                           secondaryTextColor : "#008B00" },

                                         "hover" :  { lineStyle : "stroke",
                                                      lineColor : "#22AD22",
                                                      primaryTextColor : "#22AD22",
                                                      secondaryTextColor : "#22AD22" },

                                         "active" : { lineStyle : "stroke",
                                                      lineColor : "#33BE33",
                                                      primaryTextColor : "#33BE33",
                                                      secondaryTextColor : "#33BE33" }
                                       },

                        "unexpected" : { "defaultLine" : { lineStyle : "stroke",
                                                           lineColor : "#D2691E",
                                                           primaryTextColor : "#D2691E",
                                                           secondaryTextColor : "#D2691E" },

                                         "hover" :  { lineStyle : "stroke",
                                                      lineColor : "#EE7621",
                                                      primaryTextColor : "#EE7621",
                                                      secondaryTextColor : "#EE7621" },

                                         "active" : { lineStyle : "stroke",
                                                      lineColor : "#EE7621",
                                                      primaryTextColor : "#EE7621",
                                                      secondaryTextColor : "#EE7621" }
                                       } 
    };

	// private array of objects, each containing the state of a complete message flow diagram
	var messageFlowControllers = [];
	
	function MessageFlowController() {
        this.messageLines = [];
        this.activeMessageLine;
        this.nodes = [];
        this.container;
        this.canvas;
        this.messageSpaceRemaining;
    }
	
	MessageFlowController.prototype.checkArgumentsAreValid = function(args) {
    	var i = 0;
		
		if (!args) {
    		throw {
    			name : "Invalid argument exception",
    			message : "No MessageFlow construction parameters specified."
    		};
    	}
    	
    	if (!args.container) {
    		throw {
    			name : "Invalid argument exception",
    			message : "No container specified in MessageFlow construction parameters."
    		};
    	}
    	
    	if (typeof args.container !== 'string' && typeof args.container !== 'object') {
    		throw {
    			name : "Invalid argument exception",
    			message : "Invalid container type specified in MessageFlow construction parameters. Valid types: String or Object."
    		};
    	}
    	
    	if (!args.nodeNames || args.nodeNames.length == 0) {
    		throw {
    			name : "Invalid argument exception",
    			message : "No nodes specified in MessageFlow construction parameters."
    		};
    	}
    	
    	for (i; i < args.nodeNames.length; i++) {
    		if (typeof args.nodeNames[i] !== 'string') {
    			throw {
        			name : "Invalid argument exception",
        			message : "Node specified in MessageFlow construction parameters is not a string. nodeName index:" + i
        		};
    		}
    	}
    };

    MessageFlowController.prototype.constructDiagram = function(args) {
    	this.checkArgumentsAreValid(args);
    	this.getSvgCanvas(args.container, args.nodeNames);
    	
    	this.messageSpaceRemaining = parseInt(this.container.style.height, 10) - NODE_LINE_START_Y - MARGIN;
    	
    	this.constructNodes(args.nodeNames);
    	
    	return this;
    };
    
    MessageFlowController.prototype.getSvgCanvas = function(domContainer, nodeNames)
    {
    	var containerWidth, widthOfAllRectangles, widthOfAllGaps, requiredWidth;
        
        if (typeof domContainer === "object")
        {
        	this.container = domContainer;
        }
        else if (typeof domContainer === "string")
        {
        	this.container = document.getElementById(domContainer);
        }

        // make sure the container is big enough for all the nodes defined
        containerWidth = parseInt(this.container.style.width, 10);
        widthOfAllRectangles = nodeNames.length * NODE_RECT_WIDTH;
        widthOfAllGaps = ((nodeNames.length - 1) * MARGIN) + (MARGIN * 2);
        requiredWidth = widthOfAllRectangles + widthOfAllGaps;

        if (containerWidth < requiredWidth)
        {
        	throw {
    			name : "Display exception",
    			message : "DOM Container not wide enough to display all specified nodes"
    		};
        }

        this.container.innerHTML = ""; // make sure container is empty

        this.canvas = Raphael(this.container, containerWidth, parseInt(this.container.style.height, 10));
    };
    
    MessageFlowController.prototype.constructNodes = function(nodeNames) {
    	var i;
    	var gap = this.getBoxGap(nodeNames.length);
    	var nextOffset = gap; 
    	
    	for (i=0; i<nodeNames.length; i++)
        {
            this.nodes.push(new Node().construct(this.canvas, nodeNames[i], nextOffset));
            nextOffset += gap + NODE_RECT_WIDTH;
        }
    };
    
    MessageFlowController.prototype.getBoxGap = function(nodeCount) {
    	// find the total horizontal empty space so it can be divided evenly
        var totalHorizontalEmptySpace = this.canvas.width - (NODE_RECT_WIDTH * nodeCount);
        return (totalHorizontalEmptySpace / (nodeCount + 1));
    };
    
    MessageFlowController.prototype.stretchCanvasToFitNewMessageLine = function() {
    	
    	var heightIncreaseRequired, i;
    	
        if (this.messageSpaceRemaining < SPACE_REQUIRED_FOR_NEW_MESSAGE_LINE)
        {
            // Increase paper and container height
            heightIncreaseRequired = SPACE_REQUIRED_FOR_NEW_MESSAGE_LINE - this.messageSpaceRemaining;
            this.canvas.setSize(this.canvas.width, this.canvas.height + heightIncreaseRequired);
            this.container.style.height = (parseInt(this.container.style.height, 10) + heightIncreaseRequired) + "px";			
    		
            // Extend all the node columns downward
            for (i=0; i<this.nodes.length; i++)
            {
                var p = this.nodes[i].linePath;
                p.attr({path:"M " + p.attr("path")[0][1] + "," + p.attr("path")[0][2] + " V " + (p.attr("path")[1][1] + heightIncreaseRequired)});
            }
            
            this.messageSpaceRemaining += heightIncreaseRequired - MESSAGE_LINE_GAP;
        } else {
        	this.messageSpaceRemaining -= MESSAGE_LINE_GAP;
        }
    };
    
    function Node() {
    	this.lineOffsetX;
    	this.linePath;
    	this.style = {
    		lineColor : "#aaa",
    		boxBorderColor : "#000",
    		fontSize : "14",
    		textColor : "#000"
    	};
    }
    
    Node.prototype.construct = function(canvas, nodeName, offset) {
    	var boxOffsetX = offset;
    	this.lineOffsetX = offset + HALF_NODE_RECT_WIDTH;
    	
    	this.constructNodeTitleBox(canvas, boxOffsetX, nodeName);
        this.constructNodeLine(canvas);
        
    	return this;
    };

    Node.prototype.constructNodeTitleBox = function(canvas, boxOffsetX, nodeName) {
        canvas.rect(boxOffsetX, MARGIN, NODE_RECT_WIDTH, NODE_RECT_HEIGHT).attr({"stroke": this.style.boxBorderColor});
        canvas.text(this.lineOffsetX, NODE_TEXT_START_Y, nodeName).attr({'text-anchor':'middle', fill: this.style.textColor, "font-size": this.style.fontSize});
    };
    
    Node.prototype.constructNodeLine = function(canvas) {
    	this.linePath = canvas.path("M " + this.lineOffsetX + " " + NODE_LINE_START_Y + " V " + (parseInt(canvas.height, 10) - MARGIN)).attr({"stroke": this.style.lineColor});
    };
    
    //Node.prototype.setStyle = function(args) {};
    
    // This contructor is private, however MessageLine objects are exposed via the addMessageLine
    function MessageLine() {
    	this.linePath;
    	this.arrowPath;
    	this.primaryText;
    	this.secondaryText;
        this.callbackFunction;
        this.lineType = "expected";
    }
    
    MessageLine.prototype.checkArgumentsAreValid = function(args, nodeCount) {
    	if (!args) {
    		throw {
    			name : "Invalid argument exception",
    			message : "No message line parameters provided."
    		};
    	}
    	
    	if (!args.from || !args.to || !args.primaryText) {
    		throw {
    			name : "Invalid argument exception",
    			message : "Insufficient message line parameters provided."
    		};
    	}
    	
    	if ((args.from < 0) || (args.from > nodeCount) || (args.to < 0) || (args.to > nodeCount) || (args.from == args.to))
        {
    		throw {
    			name : "Invalid argument exception",
    			message : "Invalid message line range (from <-> to)."
    		};
        }

        if (args.callback && typeof args.callback !== 'function') {
            throw {
                name : "Invalid argument exception",
                message : "Invalid callback object, must be a function."
            };
        }

        if (args.lineType && (args.lineType !== "expected" && args.lineType !== "received" && args.lineType !== "unexpected")) {
            throw {
                name : "Invalid argument exception",
                message : "Invalid argument lineStyle."
            };
        }
    };
    
    MessageLine.prototype.construct = function(canvas, args, fromOffsetX, toOffsetX, yOffset) {
		
        var textAnchor = "start";
        var indent = 8;
        
        // Prepare to create an arrow to go at the end of the message line
        var size = 6;
        var x = toOffsetX + size;
        var l1 = x + " " + (yOffset - size);
        var l2 = x + " " + (yOffset + size);
        var l3 = toOffsetX + " " + yOffset;
    	
        if (args.lineType) {
            this.lineType = args.lineType;
        }

        // Point left or right
        if (fromOffsetX < toOffsetX)
        {
            x = toOffsetX - size;
            l1 = x + " " + (yOffset - size);
            l2 = x + " " + (yOffset + size);
        }
        else
        {
            textAnchor = "end";
            indent = -8;
        }

        // Draw arrow at the end of the message line using the path coordinates resolved above
        this.arrowPath = canvas.path("M " + toOffsetX + " " + yOffset + " L" + l1 + " L" + l2 + " L" + l3);
        
        // Draw message line
        this.linePath = canvas.path("M " + fromOffsetX + ", " + yOffset + " H " + toOffsetX);
        
        // Display primary text
        this.primaryText = canvas.text(fromOffsetX + indent, yOffset-12, args.primaryText).attr({
        	'text-anchor': textAnchor,
        	'font-size': 13,
        	'font-style': "bold"});

        // Display secondary text, if it was supplied by the user
        if (args.secondaryText && (typeof args.secondaryText === "string"))
        {
            this.secondaryText = canvas.text(fromOffsetX + indent, yOffset+10, args.secondaryText).attr({
            	'text-anchor': textAnchor,
            	'font-size': 12});
        }
    	
        this.setDefaultStyle();

        this.callbackFunction = args.callback;

    	return this;
    };
    
    MessageLine.prototype.bindMouseEvents = function(messageLineController)
    {
        this.primaryText.attr({cursor:"pointer"});
        this.secondaryText.attr({cursor:"pointer"});
        this.linePath.attr({cursor:"pointer"});
        this.arrowPath.attr({cursor:"pointer"});

        var that = this;

        this.primaryText.click(function(evt) {
            if (messageLineController.activeMessageLine) {
                // un-highlight the last clicked message line
                messageLineController.activeMessageLine.setDefaultStyle();    
            }
            
            // hightlight the clicked message line
            that.setActiveStyle();

            messageLineController.activeMessageLine = that;

            // execute callback function
            if (that.callbackFunction) {
                that.callbackFunction();
            }
        });

        this.primaryText.hover(function() {
            that.setHoverStyle();
        }, function() {
            if (that !== messageLineController.activeMessageLine)
            {
                that.setDefaultStyle();
            }
        });

        this.secondaryText.hover(function() {
            that.setHoverStyle();
        }, function() {
            if (that !== messageLineController.activeMessageLine)
            {
                that.setDefaultStyle();
            }
        });
    };

    MessageLine.prototype.setStyle = function(styleObj) {
        var linePathAttr = { 'stroke' : styleObj.lineColor };
        if (styleObj.lineStyle === "stroke") {
            linePathAttr['stroke-width'] = 2;
        } else if (styleObj.lineStyle === "stroke-dasharray") {
            linePathAttr[styleObj.lineStyle] = "--";
        }
        
        this.linePath.attr(linePathAttr);

        this.arrowPath.attr({ 'fill' : styleObj.lineColor, 'stroke' : styleObj.lineColor });
        this.primaryText.attr({ 'fill' : styleObj.primaryTextColor });
        
        if (this.secondaryText)
        {
            this.secondaryText.attr({ 'fill' : styleObj.secondaryTextColor });
        }
    };

    MessageLine.prototype.setDefaultStyle = function() {
        this.setStyle(LINE_STYLES[this.lineType].defaultLine);
    };

    MessageLine.prototype.setHoverStyle = function() {
        this.setStyle(LINE_STYLES[this.lineType].hover);
    };

    MessageLine.prototype.setActiveStyle = function() {
        this.setStyle(LINE_STYLES[this.lineType].active);
    };
    
    // Attaches the single namespace to the global object.
    // This constructor is used as a function expression by the user (ie, using the 'new' keyword)
	// return: the MessageFlow object
	glob.MessageFlow = function(args) {
		this.id = messageFlowControllers.push(new MessageFlowController().constructDiagram(args)) - 1;
    };

    // return: the id of the message line
    MessageFlow.prototype.addMessageLine = function(args) {
    	var messageFlowController = messageFlowControllers[this.id];
    	var messageLine = new MessageLine();
    	var fromOffsetX, toOffsetX, yOffset;
    		
    	messageLine.checkArgumentsAreValid(args);
    	messageFlowController.stretchCanvasToFitNewMessageLine();
    	
    	fromOffsetX = messageFlowController.nodes[args.from - 1].lineOffsetX;
    	toOffsetX = messageFlowController.nodes[args.to - 1].lineOffsetX;
    	yOffset = parseInt(messageFlowController.canvas.height, 10) - MARGIN - messageFlowController.messageSpaceRemaining;
    	messageLine.construct(messageFlowController.canvas, args, fromOffsetX, toOffsetX, yOffset);
    	messageLine.bindMouseEvents(messageFlowController);

        if (args.lineStyle) {
            messageFlowController.activeMessageLine = messageLine;
        }

        // create new MessageLine and add it to the list of current lines
		return messageFlowController.messageLines.push(messageLine) - 1;
    };

}(window));

