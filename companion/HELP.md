# DirectOut

## PRODIGY.MC, PRODIGY.MP, PRODIGY.MX and MAVEN.A

### Devices

- PRODIGY.MC&nbsp;&nbsp;&nbsp;&nbsp;(System v25.08.1 tested)
- PRODIGY.MP&nbsp;&nbsp;&nbsp;&nbsp;(System v25.08.1 tested)
- PRODIGY.MX&nbsp;&nbsp;&nbsp;&nbsp;(System v25.08.1 tested)
- MAVEN.A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(System v25.11.0 tested)

Compatible with Companion version 4.0.0 or later.

### Module

The module works adaptive, it automatically detects the device type and matches actions, feedback and variables. The same configuration can be used with different device types. A routing button for "MADI1 IN 1" to "NET 1 OUT 1" does the same on any device type, as long as the hardware and software configuration is compatible.

User Labels are shown in many dropdown selections. The naming scheme usually is:

> **user slot name** - **user channel name** (**default slot name** – **default channel name**)

By default, DirectOut devices add the abbreviated slot name to each channel. This will lead to some redundant information in Companion and is not an error. Just change the channel labels to your liking.

### Actions

All parameter control actions features a learn button. This button allows to learn the currently used value from the device. This is especially useful when an action should redo the current behaviour of the device. You do not have to look up the current value yourself and enter it, the learn button will do it for you.

### Routing

The module helps you a lot with different audio routing tasks. First of all, there is no differentiation between the I/O routing and the DSP routing like in Globcon. All sources and all destinations are presented in one place.

There are different approaches of how to execute routing. Use the `Routing: Patch Route` action to assign one source to one destination immediately. Remember that you can search the options of a dropbox just by start typing into the dropbox.  
If you want to simulate a matrix panel, use the actions to select sources and destinations and then tie the route with `Routing: Take Selected Route`. There are feedbacks to show wether a source or destination is currently selected to help you keep track of the status.  
You can either build a three-press-workflow where you select the source and destination and press take or you can build a two-press-workflow where you select the destination and then immediately route the source by selecting it. Just build a sequential group for that to select the source and then take it on one button.  
You can also change the selection quite conveniently with a rotary knob by using the `Select Previous item` and `Select Next item` options. Even better you can specify a list of channels thst will be used by the previous and next options and in that list specification you can enter any channels in your preferred order and you can also use globbing. think of it like a search term e.g. enter madi1 for all inputs of the first madi slot, use net*\_1 for all channels 1, 10-19, 100-199 of all network slots because they all contain the search term. IF you want to end the search use a $-sign, e.g. net*\_1$ finds only the first channel of any network slot. (the engine behind that is regular expression matching with the \* interpreted as -?\d+).  
The Take Selected Route action also has a channel count option that lets you route multiple consecutive channels in one go. That is convenient for stereo pairs or surround channels. Take will start with the selected source and destination and then route also the following n sources to the following n destinations. There are two exceptions: 1. when the selected source is 'Unassigned', all destinations will be unassigned. 2. when one of the destinations to route is a channel with multiple pickoff points, the automatism will not advance thru all pickoff points of the channels, but use the same pickoff point and advance thru the channels.

### Custom Action

There is one slightly different action: The **Set Custom Value** action. This action also features the learn button, but it works different. When you press the learn button here, the parameters for the last change in the device will be entered. It works like a Macro-recorder for one command. Just edit something on the device and press the learn button. The action will be filled with the values needed to recreate the last change.

Caveat: Sometimes it can happen that other automations are also changing parameters. You will not only get your own last change, but also the last change of the other automation. This can lead to unexpected results. Use with care.

### Custom Feedback

The **Create Custom Variable** feedback does not change the visual style of the button. It observes a value and stores this in a connection variable. You can select the value to observe by a path pointing to that value. When learn button is pressed, the path of the last changed value will be automatically filled in, just like with the custom set action. You can choose the name of the variable that should be created. A variable will only be created, when a valid name is entered. Valid characters are a-z, A-Z, 0-9, score and underscore. If the same variable name is entered in different feedbacks, all of them will write their values to the same variable, the variable value will always show the last value written to it. It´s also possible to use a name that already is used by a default variable. In this case the feedback will write its value to the default variable in the same way. Unless you have a very good reason to use the name of a default variable, it is recommended to use different and unique names.

Besides the fixed actions and feedbacks, the custom feadback gives the opportunity to control nearly every function in the devices. Actions and feedback that appear to be missing can be created in no time at all.

### Presets

To make things even easier, a selection of presets is provided with the module. The color scheme for the presets can be adjusted in the module configuration.  
Due to the vast number of parameters and possible combinations, presets are only given for one channel or item. Use a preset as a starting point and edit it to reflect your needed channel.
