@echo off
title ShopFloor Backend Server (Port 8003)
cd /d "%~dp0Backend"
echo ========================================================
echo   Starting ShopFloor Backend Service (Port 8003)
echo ========================================================
echo.
server.exe
if errorlevel 1 (
    echo.
    echo Backend exited with an error. Please check your .env configuration.
)
pause
