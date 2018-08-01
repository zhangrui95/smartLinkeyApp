@echo off
timeout /t 1
start "ec" "%~dp0\fpatch.exe" "%~dp0\downloads\package.zip"
timeout /t 1
start "ec" "%~dp0\SmartLinkey.exe"
exit
