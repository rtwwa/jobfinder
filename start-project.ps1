# JobFinder Project Launcher
# PowerShell скрипт для запуска проекта

Write-Host "🚀 JobFinder Project Launcher" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Проверяем, что мы в корневой папке проекта
if (-not (Test-Path "frontend-jobfinder") -or -not (Test-Path "backend-jobfinder")) {
    Write-Host "❌ Ошибка: Скрипт должен запускаться из корневой папки проекта!" -ForegroundColor Red
    Write-Host "Убедитесь, что вы находитесь в папке jobfinder/" -ForegroundColor Yellow
    exit 1
}

# Функция для установки зависимостей
function Install-Dependencies {
    param($folder, $name)
    
    Write-Host "📦 Устанавливаем зависимости для $name..." -ForegroundColor Yellow
    Set-Location $folder
    
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Зависимости для $name установлены успешно!" -ForegroundColor Green
        } else {
            Write-Host "❌ Ошибка при установке зависимостей для $name" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Ошибка при установке зависимостей для $name: $_" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Функция для запуска сервера
function Start-Server {
    param($folder, $name, $command)
    
    Write-Host "🚀 Запускаем $name..." -ForegroundColor Yellow
    Set-Location $folder
    
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm $command" -WindowStyle Normal
        Write-Host "✅ $name запущен в новом окне!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка при запуске $name: $_" -ForegroundColor Red
        return $false
    }
    
    Set-Location ..
    return $true
}

# Функция для запуска seed
function Start-Seed {
    Write-Host "🌱 Запускаем seed для базы данных..." -ForegroundColor Yellow
    Set-Location "backend-jobfinder"
    
    try {
        node seed.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ База данных заполнена тестовыми данными!" -ForegroundColor Green
        } else {
            Write-Host "❌ Ошибка при заполнении базы данных" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Ошибка при запуске seed: $_" -ForegroundColor Red
    }
    
    Set-Location ..
}

# Основной процесс
Write-Host "1️⃣ Устанавливаем зависимости..." -ForegroundColor Blue

# Устанавливаем зависимости для backend
if (-not (Install-Dependencies "backend-jobfinder" "Backend")) {
    Write-Host "❌ Не удалось установить зависимости для backend" -ForegroundColor Red
    exit 1
}

# Устанавливаем зависимости для frontend
if (-not (Install-Dependencies "frontend-jobfinder" "Frontend")) {
    Write-Host "❌ Не удалось установить зависимости для frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Все зависимости установлены!" -ForegroundColor Green

# Спрашиваем про seed
Write-Host ""
$runSeed = Read-Host "🌱 Запустить seed для заполнения базы данных тестовыми данными? (y/n)"
if ($runSeed -eq "y" -or $runSeed -eq "Y" -or $runSeed -eq "yes" -or $runSeed -eq "Yes") {
    Start-Seed
}

Write-Host ""
Write-Host "2️⃣ Запускаем серверы..." -ForegroundColor Blue

# Запускаем backend
if (-not (Start-Server "backend-jobfinder" "Backend Server" "start")) {
    Write-Host "❌ Не удалось запустить backend" -ForegroundColor Red
    exit 1
}

# Небольшая задержка перед запуском frontend
Start-Sleep -Seconds 2

# Запускаем frontend
if (-not (Start-Server "frontend-jobfinder" "Frontend Server" "run dev")) {
    Write-Host "❌ Не удалось запустить frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Проект JobFinder успешно запущен!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Для остановки серверов закройте соответствующие окна PowerShell" -ForegroundColor Yellow
Write-Host "💡 Или нажмите Ctrl+C в каждом окне" -ForegroundColor Yellow 