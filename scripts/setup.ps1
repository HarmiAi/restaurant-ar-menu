Write-Host "`n=== Lumiere Setup ===" -ForegroundColor Cyan

# Check Docker
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "Starting MongoDB with Docker..." -ForegroundColor Yellow
    Set-Location $PSScriptRoot\..
    docker compose up -d mongodb
    Start-Sleep -Seconds 5
    Write-Host "MongoDB started on port 27017" -ForegroundColor Green
} else {
    Write-Host "Docker not found. Install MongoDB manually or install Docker Desktop." -ForegroundColor Red
    Write-Host "Download MongoDB: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

# Create .env if missing
$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $PSScriptRoot "..\.env.example") $envFile
    Write-Host ".env file created" -ForegroundColor Green
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. npm run dev:api     (Terminal 1 - Backend)" -ForegroundColor White
Write-Host "  2. npm run dev         (Terminal 2 - Frontend)" -ForegroundColor White
Write-Host "  3. Open http://localhost:5173/register" -ForegroundColor White
Write-Host ""
