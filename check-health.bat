@echo off
title TaskFlow Health Check
echo ========================================
echo         TaskFlow Health Check
echo ========================================
echo.

echo Checking if servers are running...
echo.

echo [1] Checking Backend (Port 5000)...
netstat -an | findstr :5000 >nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend server is running on port 5000
) else (
    echo ❌ Backend server is NOT running on port 5000
)

echo.
echo [2] Checking Frontend (Port 3000)...
netstat -an | findstr :3000 >nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Frontend server is running on port 3000
) else (
    echo ❌ Frontend server is NOT running on port 3000
)

echo.
echo [3] Testing Backend API...
curl -s http://localhost:5000/health >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend API is responding
    echo Backend Health: http://localhost:5000/health
) else (
    echo ❌ Backend API is not responding
    echo Make sure the backend server is running
)

echo.
echo [4] Testing Frontend...
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Frontend is responding
    echo Application URL: http://localhost:3000
) else (
    echo ❌ Frontend is not responding
    echo Make sure the frontend server is running
)

echo.
echo ========================================
echo         Health Check Complete
echo ========================================
echo.
echo If both servers are running, your TaskFlow app should be available at:
echo http://localhost:3000
echo.
pause
