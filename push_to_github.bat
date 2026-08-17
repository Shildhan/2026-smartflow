@echo off
cd /d "%~dp0"
echo ===================================================
echo   SmartFlow - Push to GitHub Repository
echo   Target: https://github.com/Shildhan/2026-smartflow.git
echo ===================================================
echo.

set "PATH=%~dp0bin\git\cmd;%PATH%"

echo 1. Staging all modified files...
git add .

echo 2. Committing latest changes...
git commit -m "feat: SmartFlow complete enterprise traffic management and simulation platform"

echo 3. Pushing to GitHub (main branch)...
git push -u origin main

echo.
echo ===================================================
echo   Push process finished!
echo ===================================================
pause
