@echo off
if exist "%~dp0backend\dist\triveni-backend.exe" (
    echo Starting Triveni Backend Executable (.exe)...
    cd /d "%~dp0backend\dist"
    triveni-backend.exe
) else (
    echo Starting Triveni Backend Server with Node.js...
    cd /d "%~dp0backend"
    node src/server.js
)
pause
