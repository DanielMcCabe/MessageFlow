/* Message Flow - Version 1.0 - JavaScript library for displaying a dynamic and interactive sequence of messages.
 * 
 * Copyright (c) 2013 Daniel McCabe (http://www.messageflowjs.com)
 * 
 * License: Licensed under the MIT license.
 * 
 * Built using: Raphael - v2.1.0 - JavaScript Vector Library
 *              By Dmitry Baranovskiy (http://raphaeljs.com)
 *              Licensed under the MIT license.
 * 
 * --------------------------------------------------------------
 * 
 * Example usage:
 *
 *   // Create the diagram and draw the nodes/columns
 *   var mFlow = new MessageFlow("container", ["Node 1", "Node 2", "Node 3", "Node 4"]);
 *   
 *   // or using a reference to the DOM element..
 *   var obj = document.getElementById("container");
 *   var mFlow = new MessageFlow(obj, ["Node 1", "Node 2", "Node 3", "Node 4"]);
 *   
 *   
 *   // Add a message line
 *   var data = {...};
 *   mFlow.addMessageLine({from : 1,
 *						   to : 2,
 *						   primaryText : "Message one",
 *						   secondaryText : "16:12:00",
 *						   callback : someFunction,
 *						   callbackData : data});
 */ 

function MessageFlow(element, nodeNameArray)
{
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
		return;
	}
	
	container.innerHTML = ""; // make sure container is empty
	
	var nodeRectHeight = 48;
	var nodeRectWidth = 80;
	
	this.margin = 20,
	this.paper = Raphael(container, parseInt(container.style.width), parseInt(container.style.height)),
	this.nodePathArray=[],
	this.messages=[],
	this.lastMessageYOffset = (this.margin * 4) + nodeRectHeight;

	// Set up the nodeXOffsets array to contain the x-axis for the beginning of each node
	var nodeXOffsets = [];
	if (nodeNameArray.length == 1)
	{
		nodeXOffsets.push((this.paper.width/2)-(nodeRectWidth/2));
	}
	else if (nodeNameArray.length == 2)
	{
		nodeXOffsets.push(this.margin);
		nodeXOffsets.push(this.paper.width - nodeRectWidth - this.margin);
	}
	else if (nodeNameArray.length > 2)
	{
		nodeXOffsets.push(this.margin);

		var middleNumberOfNodes = (nodeNameArray.length - 2);
		var availableGap = this.paper.width - (this.margin * 2) - (nodeRectWidth * 2);
		var requiredGap = (middleNumberOfNodes * (nodeRectWidth + this.margin)) + this.margin;
		if (requiredGap < availableGap)
		{
			var availableNegativeSpace = availableGap - (nodeRectWidth * middleNumberOfNodes);
			var innerMargin = Math.round(availableNegativeSpace / (middleNumberOfNodes + 1));
			var nextOffset = this.margin;

			for (var j=0; j<middleNumberOfNodes; j++)
			{
				nextOffset += nodeRectWidth + innerMargin;
				nodeXOffsets.push(nextOffset);
			}
		}
		else
		{
			container.innerHTML = "Message Flow diagram unavailable. Too many column nodes.";
		}

		nodeXOffsets.push(this.paper.width - nodeRectWidth - this.margin);
	}

	// Create all the nodes
	for (var i=0;i<nodeNameArray.length; i++)
	{
		this.nodePathArray.push(createNode(this.paper, nodeXOffsets[i], this.margin, nodeRectWidth, nodeRectHeight, nodeNameArray[i]));
	};
	
	
	function createNode(paper, _x, _y, _width, _height, nodeText)
	{
		paper.rect(_x, _y, _width, _height);
		
		var rCenterX = (nodeRectWidth/2) + _x;
		var rCenterY = (nodeRectHeight/2) + _y;
		var rBottomY = nodeRectHeight + _y;
		
		paper.text(rCenterX, rCenterY, nodeText).attr({'text-anchor':'middle', fill:'#000', "font-size": 14});
		
		var p = paper.path("M " + rCenterX + " " + rBottomY + " V " + (parseInt(paper.height) - _y)).attr({"stroke": "#aaa"});
		return p;
	}
}

MessageFlow.prototype.addMessageLine=function(data)
{
	function isValid(from, to, nodeCount)
	{
		if ((from < 0) || (from > nodeCount) || (to < 0) || (to > nodeCount) || (from == to))
		{
			return false;
		}
		return true;
	}

	if ((typeof this.nodePathArray === "undefined") || !isValid(data.from, data.to, this.nodePathArray.length))
	{
		// Message parameters supplied by user are invalid.
		return;
	}
	
	// Create a message object that will be stored in class owned messages array.
	// Used to persist the message elements that are referenced by mouse events.
	function message(_line, _arrow, _primaryText, _secondaryText, _messages)
	{
		this.line=_line,
		this.arrow=_arrow,
		this.primaryText=_primaryText,
		this.secondaryText=_secondaryText,
		this.clicked=false,
		this.callback=data.callback,
		this.callbackData=data.callbackData;

		this.primaryText.data("message", this);

		// If there is message text, then bind the mouse events
		if (this.primaryText != null)
		{
			this.primaryText.attr({cursor:"pointer"});

			this.primaryText.click(function(evt) {
				var m = _messages;

				for (var k=0; k<m.length; k++) // avoiding use of a for-in loop as its slower that a regular for loop
				{
					m[k].clicked = false;
					m[k].primaryText.attr({fill:"black"});
					m[k].secondaryText.attr({fill:"#666"});
					m[k].line.attr({stroke:"black"});
					m[k].arrow.attr({stroke:"black"});
				}

				this.attr({fill:"blue"});
				_secondaryText.attr({fill:"blue"});
				_line.attr({stroke:"blue"});
				_arrow.attr({stroke:"blue"});

				if ((typeof this.data("message").callback !== "undefined") && (typeof this.data("message").callbackData !== "undefined") && (this.data("message").callbackData != null))
				{
					var f = this.data("message").callback;
					f(this.data("message").callbackData);
				}

				this.data("message").clicked = true;
			});

			this.primaryText.mouseover(function() {
				this.attr({fill:"blue"});
			});

			this.primaryText.mouseout(function() {
				if (!this.data("message").clicked)
				{
					this.attr({fill:"black"});
				}
			});
		}
	}

	// Extend container, paper and node columns to fit new message line, if necessary
	var mLineSpacing = this.margin*3;
	var lineHeight = this.nodePathArray[0].attr("path")[1][1] - this.nodePathArray[0].attr("path")[0][2]; // absolute bottom Y - absolute top Y
	var spareColumnHeight = lineHeight - (this.messages.length * mLineSpacing);
	if (spareColumnHeight < (mLineSpacing*2))
	{
		// Increase paper and container height
		var heightIncreaseRequired = (mLineSpacing*2) - spareColumnHeight;
		this.paper.setSize(this.paper.width, this.paper.height + heightIncreaseRequired);
		
		if (/msie/.test(navigator.userAgent.toLowerCase()))
		{
			this.paper.canvas.parentNode.style.height = (parseInt(this.paper.canvas.parentNode.style.height) + heightIncreaseRequired) + "px";			
		}
		else
		{
			this.paper.canvas.parentElement.style.height = (parseInt(this.paper.canvas.parentElement.style.height) + heightIncreaseRequired) + "px";			
		}
		
		// Extend all the node columns downward
		for (var i=0; i<this.nodePathArray.length; i++)
		{
			var p = this.nodePathArray[i];
			p.attr({path:"M " + p.attr("path")[0][1] + "," + p.attr("path")[0][2] + " V " + (p.attr("path")[1][1] + heightIncreaseRequired)});
			lineHeight += heightIncreaseRequired;
		}
	}

	// Prepare to draw the message line
	var fromNodeColumnXOffset = this.nodePathArray[data.from-1].attr("path")[0][1];
	var toNodeColumnXOffset = this.nodePathArray[data.to-1].attr("path")[0][1];

	// Draw the message line
	var line = this.paper.path("M " + fromNodeColumnXOffset + ", " + this.lastMessageYOffset + " H " + toNodeColumnXOffset);

	// Prepare to create an arrow to go at the end of the message line
	var arrow;
	var textAnchor = "start";
	var indent = 8;
	var moveToCoords = toNodeColumnXOffset + " " + this.lastMessageYOffset;
	var size = 6;
	var x = toNodeColumnXOffset + size;
	var l1 = x + " " + (this.lastMessageYOffset - size);
	var l2 = x + " " + (this.lastMessageYOffset + size);
	var l3 = toNodeColumnXOffset + " " + this.lastMessageYOffset;
	
	// Point left or right
	if (data.from < data.to)
	{
		x = toNodeColumnXOffset - size;
		l1 = x + " " + (this.lastMessageYOffset - size);
		l2 = x + " " + (this.lastMessageYOffset + size);
	}
	else
	{
		textAnchor = "end";
		indent = -8;
	}

	// Draw arrow at the end of the message line using the path coordinates resolved above
	arrow = this.paper.path("M " + moveToCoords + " L" + l1 + " L" + l2 + " L" + l3).attr("fill","black");

	// Display primary text, if it was supplied by the user
	var primaryText = null;
	if ((typeof data.primaryText != "undefined") && (data.primaryText != null))
	{
		primaryText = this.paper.text(fromNodeColumnXOffset + indent, this.lastMessageYOffset-12, data.primaryText).attr({'text-anchor':textAnchor, fill:'#000', "font-size":13, "font-style":"bold"});
	}

	// Display secondary text, if it was supplied by the user
	var secondaryText = null;
	if ((typeof data.secondaryText != "undefined") && (data.secondaryText != null))
	{
		secondaryText = this.paper.text(fromNodeColumnXOffset + indent, this.lastMessageYOffset+10, data.secondaryText).attr({'text-anchor':textAnchor, fill:'#666', "font-size":12});
	}

	// Create, save and return a new message object 
	var m = new message(line, arrow, primaryText, secondaryText, this.messages);
	this.messages.push(m);
	this.lastMessageYOffset += mLineSpacing;

	return m;
};
