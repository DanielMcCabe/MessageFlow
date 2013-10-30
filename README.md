Message Flow
============

About
-----------------------------------------

MessageFlow is a small JavaScript library for displaying a dynamic and interactive sequence of messages.

Dependancies
-----------------------------------------

* [Raphael JS] [raphael]

Usage
-----------------------------------------

Create a placeholder div to put the MessageFlow diagram in. You will need to set the width and height also as the MessageFlow library bases its
initial size on the dimensions of the placeholder div.

```
<div id="placeholder" style="width:600px;height:600px;"></div>
```

Create the MessageFlow nodes (the columns that messages flow between):

```
var mFlow = new MessageFlow({ container : "placeholder",
                              nodeNames : ["Node 1", "Node 2", "Node 3"] });
```

Or, instead of passing in the _id_ of the placeholder div simply pass in the DOM element like so:

```
var placeHolder = document.getElementById("placeholder");

var mFlow = new MessageFlow({ container : placeHolder,
                              nodeNames : ["Node 1", "Node 2", "Node 3"] });
```

Add a message line, from one column to another:

```
mflow.addMessageLine({ from          : 1,
                       to            : 2,
                       primaryText   : "Message one",
                       secondaryText : "16:12:00",
                       lineType      : "expected",
                       callback      : someFunction });
```

'addMessageLine(...)' parameters:

* __from__          - The node (column) that the message line starts from. Column numbers start at 1, not 0.
* __to__            - The node (column) where the message line finishes.
* __primaryText__   - The text that is displayed above the message line (for example, the name of the message).
* __secondaryText__ - The text that is displayed below the message line (for example, a message sent / arrival timestamp).
* __lineType__      - (Optional) The uniquely styled type of message line to use. Default is "unexpected".
* __callback__     - The function that is called when a user clicks on the primary message text. This function might do something like display extra details about a message.

Feedback
----------------------------------------

All feedback is welcome, whether it be about a bug, an improvement, or just if you like or dislike the project.

Please send all feedback to contact@dannymccabe.com

Copyright and licence
----------------------------------------

Copyright &copy; 2013 Daniel McCabe (http://www.dannymccabe.com)

Licensed under the __MIT__ license.

[raphael]: https://github.com/DmitryBaranovskiy/raphael/
