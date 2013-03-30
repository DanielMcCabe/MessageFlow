Message Flow
============

About
-----------------------------------------

MessageFlow is a small JavaScript library for displaying a dynamic and interactive sequence of messages.

Dependancies
-----------------------------------------

- Raphael JS

Usage
-----------------------------------------

Create a placeholder div to put the MessageFlow diagram in. You will need to set the width and height also as the MessageFlow library bases its
dimentions on the dimensions of the placeholder div.

<div id="placeholder" style="width:600px;height:600px;"></div>

Create the MessageFlow nodes (the columns that messages flow between):

var mFlow = new MessageFlow({container : "placeholder",
                             nodeNames : ["Node 1", "Node 2", "Node 3"]});

Add a message line, from one column to another:

mflow.addMessageLine(from          : 1,
                     to            : 2,
                     primaryText   : "Message one",
                     secondaryText : "16:12:00",
                     callback      : someFunction,
                     callbackData  : {someData:"blah", someMoreData:"ja"});

'addMessageLine(...)' parameters

from          - The node (column) that the message line starts from.
to            - The node (column) where the message line finishes.
primaryText   - The text that is displayed above the message line (for example, the name of the message).
secondaryText - The text that is displayed below the message line (for example, a message sent / arrival timestamp).
callback      - The function that is called when a user clicks on the primary message text. This function might do something like
                display extra details about a message.
callbackData  - The data that is passed into the callback function when it is called. This data parameter is an object.

Feedback
----------------------------------------

All feedback is welcome, whether it be about a bug, an improvement, or just if you like or dislike the project.

Please send all feedback to contact@dannymccabe.com

Copyright and licence
----------------------------------------

Copyright c 2013 Daniel McCabe (http://www.dannymccabe.com)

Licensed under the MIT license.
