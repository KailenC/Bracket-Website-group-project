Write-Host "Resetting database"

# Stop script on errors
$ErrorActionPreference = "Stop"

# Load .env variables
Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*#") { return }
    if ($_ -match "=") {
        $key, $value = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim())
    }
}

# Try to find psql automatically
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    # fallback common install path
    $defaultPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

    if (Test-Path $defaultPath) {
        $psqlPath = $defaultPath
    } else {
        Write-Error "psql not found. Make sure PostgreSQL is installed and added to PATH."
        exit 1
    }
} else {
    $psqlPath = $psqlPath.Source
}

Write-Host "Using psql at: $psqlPath"

# Run SQL file
& $psqlPath -U $env:DB_USER -d $env:DB_NAME -f "./src/config/db.init.sql"

# Check if command failed
if ($LASTEXITCODE -ne 0) {
    Write-Error "Database reset failed."
    exit $LASTEXITCODE
}

Write-Host "Database reset complete"