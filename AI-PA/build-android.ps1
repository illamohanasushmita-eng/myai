Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Personal Assistant - Android Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "[✓] Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Java is not installed!" -ForegroundColor Red
    Write-Host "Please install JDK 17 from https://adoptium.net/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[✓] Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[2/5] Building Next.js application..." -ForegroundColor Yellow
npm run export
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to build Next.js app!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[✓] Next.js build complete" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Checking if Android platform exists..." -ForegroundColor Yellow
if (-not (Test-Path "android")) {
    Write-Host "Android platform not found. Adding Android platform..." -ForegroundColor Yellow
    npx cap add android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[✗] Failed to add Android platform!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[✓] Android platform added" -ForegroundColor Green
} else {
    Write-Host "[✓] Android platform exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/5] Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to sync with Capacitor!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[✓] Capacitor sync complete" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Opening Android Studio..." -ForegroundColor Yellow
npx cap open android
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to open Android Studio!" -ForegroundColor Red
    Write-Host "Please make sure Android Studio is installed." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build preparation complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps in Android Studio:" -ForegroundColor Yellow
Write-Host "1. Wait for Gradle sync to complete"
Write-Host "2. Click Build > Build Bundle(s) / APK(s) > Build APK(s)"
Write-Host "3. Wait for build to complete"
Write-Host "4. Click 'locate' to find your APK"
Write-Host ""
Write-Host "APK will be located at:" -ForegroundColor Cyan
Write-Host "android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"

