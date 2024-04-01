@echo off
echo Downloading Node.js...
curl -o nodejs.zip https://nodejs.org/dist/latest/node-v14.18.3-win-x64.zip

echo Extracting Node.js...
tar -xf nodejs.zip

echo Setting up Node.js...
setx PATH "%PATH%;%CD%\node-v14.18.3-win-x64"

echo Installing npm packages
call npm install

echo Starting Overlay...
cls
node express.js
pause
