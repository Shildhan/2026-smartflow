@echo off
echo ========================================================
echo   Starting SmartFlow Traffic Management Platform
echo ========================================================
echo.

start "SmartFlow Backend Server (Port 5000)" cmd /k "cd server && npm.cmd run dev"
timeout /t 2 /nobreak >nul

start "SmartFlow Frontend Client (Port 5173)" cmd /k "cd client && npm.cmd run dev"

echo.
echo ========================================================
echo   Both services are launching:
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:5173
echo ========================================================
echo.
pause
