@echo off
echo Reloading Nginx configuration...
cd /d "C:\nginx-1.31.5"
nginx.exe -s reload
echo Nginx configuration reloaded.
pause
