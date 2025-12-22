@echo off
echo ========================================
echo   AI Personal Assistant - Android Build
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed!
    echo Please install JDK 17 from https://adoptium.net/
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [2/5] Building Next.js application...
call npm run export
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build Next.js app!
    pause
    exit /b 1
)

echo.
echo [3/5] Checking if Android platform exists...
if not exist "android" (
    echo Android platform not found. Adding Android platform...
    call npx cap add android
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to add Android platform!
        pause
        exit /b 1
    )
)

echo.
echo [4/5] Syncing with Capacitor...
call npx cap sync
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to sync with Capacitor!
    pause
    exit /b 1
)

echo.
echo [5/5] Opening Android Studio...
call npx cap open android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to open Android Studio!
    echo Please make sure Android Studio is installed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build preparation complete!
echo ========================================
echo.
echo Next steps in Android Studio:
echo 1. Wait for Gradle sync to complete
echo 2. Click Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo 3. Wait for build to complete
echo 4. Click 'locate' to find your APK
echo.
echo APK will be located at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause

