@echo off
cd /d "%~dp0"
echo ===================================================
echo   SmartFlow - 1-Click Live Vercel Deployment
echo ===================================================
echo.

echo 1. Building latest frontend bundle...
cd client
call npm run build
cd ..

echo.
echo 2. Launching Vercel Deployment...
echo    (If this is your first time, log in via your browser)
echo.
call npx --yes vercel --prod

echo.
echo ===================================================
echo   Deployment Complete! Your live URL is above.
echo ===================================================
pause
