# Billing Schema Deployment Script (PowerShell)
# This script helps deploy the billing_reminders table to Supabase

Write-Host "🚀 Billing Schema Deployment Helper" -ForegroundColor Cyan
Write-Host ""

# Check if schema file exists
$schemaFile = "src\lib\db\billing-schema.sql"
if (-Not (Test-Path $schemaFile)) {
    Write-Host "❌ Schema file not found: $schemaFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Schema file found: $schemaFile" -ForegroundColor Green
Write-Host ""

# Read the schema
$schema = Get-Content $schemaFile -Raw

Write-Host "📋 DEPLOYMENT OPTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Supabase Dashboard (Recommended)" -ForegroundColor Cyan
Write-Host "  1. Go to: https://supabase.com/dashboard" 
Write-Host "  2. Select your project"
Write-Host "  3. Click 'SQL Editor' → 'New Query'"
Write-Host "  4. Copy the schema from: $schemaFile"
Write-Host "  5. Paste and click 'Run'"
Write-Host ""

Write-Host "Option 2: Using Supabase CLI" -ForegroundColor Cyan
Write-Host "  Run these commands:"
Write-Host "  > supabase login"
Write-Host "  > supabase link --project-ref YOUR_PROJECT_REF"
Write-Host "  > Get-Content $schemaFile | supabase db execute"
Write-Host ""

# Ask user what they want to do
Write-Host "What would you like to do?" -ForegroundColor Yellow
Write-Host "1. Copy schema to clipboard (for Dashboard deployment)"
Write-Host "2. Show schema content"
Write-Host "3. Exit"
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        # Copy to clipboard
        $schema | Set-Clipboard
        Write-Host "✅ Schema copied to clipboard!" -ForegroundColor Green
        Write-Host "Now go to Supabase Dashboard → SQL Editor and paste it." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Opening Supabase Dashboard..." -ForegroundColor Cyan
        Start-Process "https://supabase.com/dashboard"
    }
    "2" {
        # Show schema
        Write-Host ""
        Write-Host "=== SCHEMA CONTENT ===" -ForegroundColor Cyan
        Write-Host $schema
        Write-Host ""
        Write-Host "=== END OF SCHEMA ===" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📚 For more help, see: BILLING_SYSTEM_COMPLETE.md" -ForegroundColor Cyan

