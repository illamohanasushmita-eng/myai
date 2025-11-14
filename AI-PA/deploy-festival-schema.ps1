# ============================================================================
# Deploy Festival Events Schema to Supabase
# ============================================================================

Write-Host "🎉 Festival Events Schema Deployment Helper" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Read the SQL file
$sqlFile = "src\lib\db\festival-schema.sql"

if (Test-Path $sqlFile) {
    Write-Host "✅ Found schema file: $sqlFile" -ForegroundColor Green
    
    # Copy to clipboard
    Get-Content $sqlFile | Set-Clipboard
    
    Write-Host "✅ SQL schema copied to clipboard!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Open your Supabase Dashboard" -ForegroundColor White
    Write-Host "2. Go to SQL Editor" -ForegroundColor White
    Write-Host "3. Paste the SQL (Ctrl+V)" -ForegroundColor White
    Write-Host "4. Click 'Run' to execute" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Opening Supabase Dashboard..." -ForegroundColor Cyan
    
    # Open Supabase dashboard
    Start-Process "https://supabase.com/dashboard/project/_/sql"
    
} else {
    Write-Host "❌ Error: Schema file not found at $sqlFile" -ForegroundColor Red
    Write-Host "Please make sure you're running this from the AI-PA directory" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

