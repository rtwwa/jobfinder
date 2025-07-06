Write-Host "🚀 JobFinder Project Launcher" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if (-not (Test-Path "frontend-jobfinder") -or -not (Test-Path "backend-jobfinder")) {
    Write-Host "❌ Error: Script must be run from the project root directory!" -ForegroundColor Red
    Write-Host "Make sure you are in the jobfinder/ folder" -ForegroundColor Yellow
    exit 1
}

function Install-Dependencies {
    param($folder, $name)
    
    Write-Host "📦 Installing dependencies for $name..." -ForegroundColor Yellow
    Set-Location $folder
    
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dependencies for $name installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Error installing dependencies for $name" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error installing dependencies for $name`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

function Start-Server {
    param($folder, $name, $command)
    
    Write-Host "🚀 Starting $name..." -ForegroundColor Yellow
    Set-Location $folder
    
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm $command" -WindowStyle Normal
        Write-Host "✅ $name started in new window!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error starting $name`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

function Start-Seed {
    Write-Host "🌱 Running seed for database..." -ForegroundColor Yellow
    Set-Location "backend-jobfinder"
    
    try {
        node seed.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database populated with test data!" -ForegroundColor Green
        } else {
            Write-Host "❌ Error populating database" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running seed`: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Set-Location ..
}

Write-Host "1️⃣ Installing dependencies..." -ForegroundColor Blue

if (-not (Install-Dependencies "backend-jobfinder" "Backend")) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

if (-not (Install-Dependencies "frontend-jobfinder" "Frontend")) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All dependencies installed!" -ForegroundColor Green

Write-Host ""
$runSeed = Read-Host "🌱 Run seed to populate database with test data? (y/n)"
if ($runSeed -eq "y" -or $runSeed -eq "Y" -or $runSeed -eq "yes" -or $runSeed -eq "Yes") {
    Start-Seed
}

Write-Host ""
Write-Host "2️⃣ Starting servers..." -ForegroundColor Blue

if (-not (Start-Server "backend-jobfinder" "Backend Server" "start")) {
    Write-Host "❌ Failed to start backend" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

if (-not (Start-Server "frontend-jobfinder" "Frontend Server" "run dev")) {
    Write-Host "❌ Failed to start frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 JobFinder project started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To stop servers, close the corresponding PowerShell windows" -ForegroundColor Yellow
Write-Host "💡 Or press Ctrl+C in each window" -ForegroundColor Yellow 