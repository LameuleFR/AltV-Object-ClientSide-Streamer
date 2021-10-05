altV ClientSide Object Streamer CSharp
ClientSide implementation of an object streamer for ALT:V MP.

Installation

This resource makes use of the AltV.Net.Async, make sure to install these nugget package to use it.
Copy serverside/Prop.cs to your gamemode.
Make sure to add the following code to your gamemode's OnStart() method:

try { new PropManager(); } catch (Exception e) { Log.Error("MAIN PropManager:" + e); });
Don't forget to call OnPlayerIsLoaded on player spawn to send object data clientside.


Copy clientside/PropManager.js in u'r clientside solution.
Add "PropManager" to your index to load it.


Misc
This package is not intended to receive futur update, we no longer use it. No support is given.
Feel Free to use it.

Made With Layak for sa-roleplay.fr
