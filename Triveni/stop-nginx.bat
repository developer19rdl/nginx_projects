@echo off
echo Stopping Nginx...
cd /d "C:\nginx-1.31.5"
nginx.exe -s quit
echo Nginx stopped.
pause
