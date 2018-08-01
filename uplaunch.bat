@echo off
timeout /t 1
start "ec" "%~dp0\fpatch.exe" "%~dp0\downloads\package.zip"
timeout /t 1
IF EXIST "%~dp0node_modules" (
    @SETLOCAL
    @SET PATHEXT=%PATHEXT:;.JS;=;%
    node "%~dp0\node_modules\electron\cli.js" .
) ELSE (
    start "ec" "%~dp0\SmartLinkey.exe"
    REM start /D "Chrome" "C:\Program Files (x86)\Google\Chrome\Application\" chrome.exe
)
exit
