@echo off
echo Starting Nginx...
cd /d "C:\nginx-1.31.5"
start "" nginx.exe
echo Nginx started. Access application at:
echo   - Admin Portal:  http://localhost/ or http://192.168.1.20/
echo   - Operator UI:   http://localhost/operator/ or http://192.168.1.20/operator/
pause
