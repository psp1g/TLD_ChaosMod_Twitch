# The Long Drive Chaos Mod Integration
The M_ChaosMod.dll is from https://github.com/psp1g/TLD_ChaosMod_Frame

## Setup instructions
1. Install this - https://kolbenlp.gitlab.io/WorkshopTLDMods/
2. Click Code at the top right, click Download ZIP
3. Extract that ZIP anywhere you want
4. Double click installMod.bat - This copies the mod file into your mod folder
5. Double click startMod.bat - This will start the server and overlay
6. Setup an OBS Browser Source as follows:
    - URL: http://localhost:3050/
    - Width: 1920
    - Height: 1080
    - You can check "Shutdown sourec when not visible", so you can cycle it on/off, in case something happens.
7. Launch The Long Drive
8. In game, press F2 to start/stop the mod. Enjoy!

## For other streamers
Open config.json in any text editor you want and change PSP1G to your own channel

## How does it work
* This is an express.js server that will be listening for requests from the mod. It also hosts the OBS overlay, and updates votes as they come in.
* The timer is set from the mod, which can be modified with Shift-F2. Anything changed in Shift-F2 will be reflected in the overlay.

## Possible updates
* Change some Meta items (such as 5x timer speed) either a percentage when items hit, or after a random amount of time
* Overlay is sometimes buggy when it 5x timer speed is going
