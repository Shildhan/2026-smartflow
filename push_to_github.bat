@echo off
cd /d "%~dp0"
echo ===================================================
echo   SmartFlow - Push to GitHub Repository
echo   Target: https://github.com/Shildhan/2026-smartflow.git
echo ===================================================
echo.

set "PATH=%~dp0bin\git\cmd;%~dp0bin\git\mingw64\bin;%PATH%"

git config credential.helper "%~dp0bin\git\mingw64\bin\git-credential-manager.exe"

echo 1. Staging all files...
git add .

echo 2. Committing files...
git commit -m "feat: complete SmartFlow enterprise platform codebase"

echo 3. Pushing to GitHub (main branch)...
git push -u origin main

echo.
echo ===================================================
echo   Push Complete!
echo ===================================================
pause
