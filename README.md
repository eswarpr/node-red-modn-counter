# @eswarpr/node-red-modn-counter

A [Node-RED](https://nodered.org) node to simulate mod-N counters such as SN74LS90 and SN74LS92
for use in your flows.

# Install

Either use the Node-RED Menu -> Manage Palette option to install, or run the following command in your Node-RED user directory -
typically ``~/.node-red``

``
npm i @eswarpr/node-red-modn-counter
``

# Usage

## mod-n counter
Generates a ``msg.payload`` of _high_ or _low_, when its internal counter reaches
the count specified in the _States_ parameter. The counter can be triggered by pulse
provided to its input. The counter "wraps around" back to post the node output going _High_.

The inputs could be an array of objects, in which case:
- The node will check for an object with _topic_ property set to "reset" and a _value_ property set to 1. If specified,
the node will reset the internal state to _0_ and process other objects in the input
- The node will check for an object with _topic_ property set to "set" and a _value_ property set to 0 or 1. If specified,
the node will change the internal state dependent on the configuration for _Trigger On_ setting.
- The node will check if the specified payload is a number. If so, the node will change the internal
state dependent on the configration for the _Trigger On_ setting.


### Outputs
- ``msg.payload`` - _any_ - _Low_ (0) when the counter has not reached the number of states specified, else _High_ (1).
