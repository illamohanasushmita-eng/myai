# Start AI-PA Development Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI-PA Development Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing Node processes
Write-Host "[1/3] Stopping existing Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Node processes stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ✓ No Node processes running" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Cleaning build cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" 2>$null
    Write-Host "   ✓ .next cache removed" -ForegroundColor Green
} else {
    Write-Host "   ✓ No .next cache found" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/3] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server URL: http://localhost:3002" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev

