/* Message Flow - Version 1.0 - JavaScript library for displaying a dynamic and interactive sequence of messages.
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
 *   var data = {...};
 *   mFlow.addMessageLine({from : 1,
 *                           to : 2,
 *                  primaryText : "Message one",
 *                secondaryText : "16:12:00",
 *                     callback : someFunction,
 *                 callbackData : data});
 */ 


/*
    MessageFlow class:
        state:     the SVG canvas, the array of created nodes, and the array of generated messages
        behaviour: creation of canvas and nodes
*/
function MessageFlow(data)
{
    // Class instance variables
    this.canvas = this._getSvgCanvas(data);
    this.nodes = [];
    this.messages = [];
    this.nodeTitleBoxGap = this._calculateGapBetweenNodeTitleBoxes(data);

    if ((this.canvas !== null) && (data.nodeNames.length > 0))
    {
        this.nodes = this._createAllNodes(data);
    }
}

MessageFlow.prototype._minCanvasWidth = 120;
MessageFlow.prototype._margin = 20;
MessageFlow.prototype._nodeRectWidth = 80;
MessageFlow.prototype._mLineSpacing = 60;
MessageFlow.prototype._mLineGap = 60;
MessageFlow.prototype._lineStartY = 68;

MessageFlow.prototype._getSvgCanvas=function(data)
{
    var element = data.container;
    var container;

    if (typeof element === "object")
    {
        container = element;
    }
    else if (typeof element === "string")
    {
        container = document.getElementById(element);
    }
    else
    {
        return null;
    }

    // make sure the container is big enough for all the nodes defined
    var containerWidth = parseInt(container.style.width, 10);
    var widthOfAllRectangles = data.nodeNames.length * this._nodeRectWidth;
    var widthOfAllGaps = ((data.nodeNames.length - 1) * this._margin) + (this._margin * 2);
    var requiredWidth = widthOfAllRectangles + widthOfAllGaps;

    if (containerWidth < requiredWidth)
    {
        return null;
    }

    container.innerHTML = ""; // make sure container is empty

    return Raphael(container, parseInt(container.style.width, 10), parseInt(container.style.height, 10));
};

MessageFlow.prototype._calculateGapBetweenNodeTitleBoxes=function(data)
{
    // find the total horizontal empty space so it can be divided evenly
    var totalHorizontalEmptySpace = this.canvas.width - (this._nodeRectWidth * data.nodeNames.length);

    return (totalHorizontalEmptySpace / (data.nodeNames.length + 1));
};

MessageFlow.prototype._createAllNodes=function(data)
{
    var createdNodes = [];
    var nodeCount = data.nodeNames.length;

    // Create all the nodes
    for (var i=1;i<=nodeCount; i++)
    {
        var newNode = new Node(data.nodeNames[i-1], this.canvas, this.nodeTitleBoxGap, nodeCount, i);
        createdNodes.push(newNode);
    }

    return createdNodes;
};

MessageFlow.prototype.addMessageLine=function(data)
{
    if ((typeof this.nodes === "undefined") || !_isValid(data.from, data.to, this.nodes.length))
    {
        // Message parameters supplied by user are invalid.
        return null;
    }

    // Extend container and canvas to fit new message line, if necessary
    var nodeLinePath = this._getNodeLinePath(0);
    var lineHeight = nodeLinePath[1][1] - nodeLinePath[0][2]; // absolute bottom Y - absolute top Y
    var remainingColumnHeight = lineHeight - (this.messages.length * this._mLineSpacing);
    if (remainingColumnHeight < (this._mLineGap * 2))
    {
        // Increase paper and container height
        var heightIncreaseRequired = (this._mLineGap * 2) - remainingColumnHeight;
        this.canvas.setSize(this.canvas.width, this.canvas.height + heightIncreaseRequired);
	
        if (/msie/.test(navigator.userAgent.toLowerCase()))
        {
            this.canvas.canvas.parentNode.style.height = (parseInt(this.canvas.canvas.parentNode.style.height, 10) + heightIncreaseRequired) + "px";			
        }
        else
        {
            this.canvas.canvas.parentElement.style.height = (parseInt(this.canvas.canvas.parentElement.style.height, 10) + heightIncreaseRequired) + "px";			
        }
		
        // Extend all the node columns downward
        for (var i=0; i<this.nodes.length; i++)
        {
            var p = this.nodes[i].linePath;
            p.attr({path:"M " + p.attr("path")[0][1] + "," + p.attr("path")[0][2] + " V " + (p.attr("path")[1][1] + heightIncreaseRequired)});
            lineHeight += heightIncreaseRequired;
        }
    }

    // Prepare to draw the message line
    var fromNodeColumnXOffset = this._getNodeLinePath(data.from-1)[0][1];
    var toNodeColumnXOffset = this._getNodeLinePath(data.to-1)[0][1];

    // Draw the message line
    var nextMessageLineYOffset = this._lineStartY + (this._mLineGap * (this.messages.length + 1));
    var line = this.canvas.path("M " + fromNodeColumnXOffset + ", " + nextMessageLineYOffset + " H " + toNodeColumnXOffset);

    // Prepare to create an arrow to go at the end of the message line
    var arrow;
    var textAnchor = "start";
    var indent = 8;
    var moveToCoords = toNodeColumnXOffset + " " + nextMessageLineYOffset;
    var size = 6;
    var x = toNodeColumnXOffset + size;
    var l1 = x + " " + (nextMessageLineYOffset - size);
    var l2 = x + " " + (nextMessageLineYOffset + size);
    var l3 = toNodeColumnXOffset + " " + nextMessageLineYOffset;
	
    // Point left or right
    if (data.from < data.to)
    {
        x = toNodeColumnXOffset - size;
        l1 = x + " " + (nextMessageLineYOffset - size);
        l2 = x + " " + (nextMessageLineYOffset + size);
    }
    else
    {
        textAnchor = "end";
        indent = -8;
    }

    // Draw arrow at the end of the message line using the path coordinates resolved above
    arrow = this.canvas.path("M " + moveToCoords + " L" + l1 + " L" + l2 + " L" + l3).attr("fill","black");

    // Display primary text, if it was supplied by the user
    var primaryText = null;
    if ((typeof data.primaryText != "undefined") && (data.primaryText !== null))
    {
        primaryText = this.canvas.text(fromNodeColumnXOffset + indent, nextMessageLineYOffset-12, data.primaryText).attr({'text-anchor':textAnchor, fill:'#000', "font-size":13, "font-style":"bold"});
    }

    // Display secondary text, if it was supplied by the user
    var secondaryText = null;
    if ((typeof data.secondaryText != "undefined") && (data.secondaryText !== null))
    {
        secondaryText = this.canvas.text(fromNodeColumnXOffset + indent, nextMessageLineYOffset+10, data.secondaryText).attr({'text-anchor':textAnchor, fill:'#666', "font-size":12});
    }

    // Create, save and return a new message object 
    var m = new Message(line, arrow, primaryText, secondaryText, this.messages, data.callback, data.callbackData, this);
    this.messages.push(m);

    return m;
};

MessageFlow.prototype._getNodeLinePath=function(index)
{
    return this.nodes[index].linePath.attr("path");
};

// Create a message object that will be stored in class owned messages array.
// Used to persist the message elements that are referenced by mouse events.
function Message(_line, _arrow, _primaryText, _secondaryText, messages, _callback, _callbackData, messageFlow)
{
    // class variables
    this.line=_line;
    this.arrow=_arrow;
    this.primaryText=_primaryText;
    this.secondaryText=_secondaryText;
    this.clicked=false;
    this.callback=_callback;
    this.callbackData=_callbackData;

    this.primaryText.data("message", messageFlow);

    this._bindMouseEvents(this, messages);
}

Message.prototype._bindMouseEvents=function(messageObj, messages)
{
    // If there is message text, then bind the mouse events
    if (this.primaryText !== null)
    {
        this.primaryText.attr({cursor:"pointer"});

        this.primaryText.click(function(evt) {
            var m = messages;

            for (var k=0; k<m.length; k++) // avoiding use of a for-in loop as its slower that a regular for loop
            {
                m[k].clicked = false;
                m[k].primaryText.attr({fill:"black"});
                m[k].secondaryText.attr({fill:"#666"});
                m[k].line.attr({stroke:"black"});
                m[k].arrow.attr({stroke:"black"});
            }

            this.attr({fill:"blue"});
            messageObj.secondaryText.attr({fill:"blue"});
            messageObj.line.attr({stroke:"blue"});
            messageObj.arrow.attr({stroke:"blue"});

            if ((typeof messageObj.callback !== "undefined") && (typeof messageObj.callbackData !== "undefined") && (messageObj.callbackData !== null))
            {
                var f = messageObj.callback;
                f(messageObj.callbackData);
            }

            messageObj.clicked = true;
        });

        messageObj.primaryText.mouseover(function() {
            this.attr({fill:"blue"});
        });

        messageObj.primaryText.mouseout(function() {
            if (!messageObj.clicked)
            {
                this.attr({fill:"black"});
            }
        });
    }
};

function _isValid(from, to, nodeCount)
{
    if ((from < 0) || (from > nodeCount) || (to < 0) || (to > nodeCount) || (from == to))
    {
        return false;
    }
    return true;
}

/*
    Node class:
        state:     properties of a node's line
*/
function Node(text, canvas, nodeTitleBoxGap, nodeCount, nodeIndex)
{
    this.lineX = -1;
    this.linePath = null;
    
    this._resolveLineOffsetX(nodeCount, nodeIndex, nodeTitleBoxGap);
    this._createNodeTitleBox(text, canvas);
    this._createNodeLine(canvas);
}

// FIX: DUPLICATED STATIC VARIABLES IN MESSAGEFLOW OBJECT
Node.prototype._nodeRectHeight = 48;
Node.prototype._nodeRectWidth = 80;
Node.prototype._nodeRectWidthHalved = 40;
Node.prototype._margin = 20;
Node.prototype._lineStartY = 68;

Node.prototype._resolveLineOffsetX=function(nodeCount, nodeIndex, nodeTitleBoxGap)
{
    if (nodeCount == 1)
    {
        this.lineX = this.canvas.width / 2;
    }
    else if (nodeCount == 2)
    {
        this.lineX = this.canvas.width / 3;
    }
    else if (nodeCount > 2)
    {
        this.lineX = (nodeTitleBoxGap * nodeIndex) + (this._nodeRectWidth * (nodeIndex - 1)) + this._nodeRectWidthHalved;
    }
};

Node.prototype._createNodeTitleBox=function(text, canvas)
{
    var boxCoordX = this.lineX - this._nodeRectWidthHalved;
    canvas.rect(boxCoordX, this._margin, this._nodeRectWidth, this._nodeRectHeight);

    var textPosY = (this._nodeRectHeight/2) + this._margin;
    canvas.text(this.lineX, textPosY, text).attr({'text-anchor':'middle', fill:'#000', "font-size": 14});
};

Node.prototype._createNodeLine=function(canvas)
{
    this.linePath = canvas.path("M " + this.lineX + " " + this._lineStartY + " V " + (parseInt(canvas.height, 10) - this._margin)).attr({"stroke": "#aaa"});
};

