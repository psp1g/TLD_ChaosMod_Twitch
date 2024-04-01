@echo off
echo Installing the mod into the user's document directory.
setlocal

rem Check if the Documents folder exists
if exist "%USERPROFILE%\Documents\" (
    rem Copy the .dll file to the specific folder within Documents
    copy "./M_ChaosMod.dll" "%USERPROFILE%\Documents\TheLongDrive\Mods"
    echo installed successfully.
) else (
    echo there was an error installing the mod, Try doing it manually by copying the M_ChaosMod.dll to
    echo Documents\TheLongDrive\Mods, And paste it there!
)
pause
endlocal
