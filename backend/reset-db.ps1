Write-Host "Resetting database"

# Load .env variables
Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*#") { return }  # skip comments
    if ($_ -match "=") {
        $key, $value = $_ -split "=", 2
        [System.Environment]::SetEnvironmentVariable($key, $value)
    }
}

# Run SQL file
psql -U $env:DB_USER -d $env:DB_NAME -f ./src/config/db.init.sql

Write-Host "Database reset complete"