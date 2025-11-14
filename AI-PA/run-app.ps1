# Helper script to install and run the Next.js app (Windows PowerShell)
# Usage: Open VS Code integrated terminal, cd to project root and run:
#   .\run-app.ps1

param(
    [int]$Port = 3002
)

function Write-Note($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Note "Running run-app.ps1 from: $(Get-Location)"

# Check package.json exists
if (-not (Test-Path -Path "package.json")) {
    Write-Err "package.json not found in the current folder. Please cd to the project root (where package.json lives)."
    exit 1
}

# Check Node
try {
    $nodeVersion = node -v 2>$null
} catch {
    $nodeVersion = $null
}

if (-not $nodeVersion) {
    Write-Err "Node.js not found in PATH. Install Node 18+ (LTS). Download from https://nodejs.org/ and re-open the terminal."
    exit 1
}
Write-Note "Node version: $nodeVersion"

# Check npm
try {
    $npmVersion = npm -v 2>$null
} catch {
    $npmVersion = $null
}
if (-not $npmVersion) {
    Write-Err "npm not found. Install Node.js which includes npm."
    exit 1
}
Write-Note "npm version: $npmVersion"

# Install dependencies (prefer npm ci if package-lock.json exists)
if (Test-Path -Path "package-lock.json") {
    Write-Note "Found package-lock.json — running npm ci"
    npm ci
} else {
    Write-Note "Running npm install"
    npm install
}

if ($LASTEXITCODE -ne 0) {
    Write-Err "Dependency install failed. Inspect the errors above. If there's a native module build error (bcrypt) on Windows, consider installing windows-build-tools or using bcryptjs."
    exit $LASTEXITCODE
}

# Start dev server on specified port
Write-Note "Starting dev server on port $Port"
# Export PORT for the current PowerShell session
$env:PORT = $Port

# Start Next dev (this will run in this terminal)
Write-Note "Running: npm run dev"
npm run dev

# Note: When you want to stop the server, press Ctrl+C in the terminal.
