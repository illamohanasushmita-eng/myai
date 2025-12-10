@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   AI-PA Development Server Restart
echo ========================================
echo.

echo [1/5] Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    - Node processes stopped
    timeout /t 2 /nobreak >nul
) else (
    echo    - No Node processes running
)

echo.
echo [2/5] Removing .next build cache...
if exist .next (
    rmdir /s /q .next 2>nul
    echo    - .next cache removed
) else (
    echo    - No .next cache found
)

echo.
echo [3/5] Removing node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache 2>nul
    echo    - node_modules cache removed
) else (
    echo    - No node_modules cache found
)

echo.
echo [4/5] Verifying package installation...
if not exist node_modules (
    echo    - Installing dependencies...
    call npm install
) else (
    echo    - Dependencies already installed
)

echo.
echo [5/5] Starting development server...
echo.
echo ========================================
echo   Server URL: http://localhost:3002
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev

