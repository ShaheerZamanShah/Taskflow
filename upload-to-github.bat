@echo off
echo ============================================
echo   TaskFlow GitHub Upload Helper
echo ============================================
echo.

echo Step 1: Make sure you have Git installed
echo If not, download from: https://git-scm.com/download/win
echo.

echo Step 2: Create a new repository on GitHub.com
echo - Go to https://github.com/new
echo - Repository name: taskflow-mern
echo - Keep it PUBLIC (for free deployments)
echo - DON'T initialize with README
echo.

echo Step 3: Replace YOUR_USERNAME and YOUR_REPO in the commands below
echo.

echo Copy and paste these commands one by one:
echo.
echo git init
echo git add .
echo git commit -m "Initial TaskFlow commit"
echo git branch -M main
echo git remote add origin https://github.com/ShaheerZamanShah/Taskflow.git
echo git push -u origin main
echo.

echo ============================================
echo After uploading to GitHub, you can use:
echo - Vercel for frontend deployment
echo - Railway for backend deployment
echo ============================================

pause
