Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX ALL ISSUES & RESTART FRONTEND  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all node processes
Write-Host "[1/4] Stopping all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "      ✅ Stopped $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "      ℹ️  No Node.js processes running" -ForegroundColor Gray
}

# Step 2: Clean caches
Write-Host ""
Write-Host "[2/4] Cleaning caches..." -ForegroundColor Yellow
Set-Location C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend

if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "      ✅ Removed .next folder" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
    Write-Host "      ✅ Removed node_modules\.cache" -ForegroundColor Green
}

# Step 3: Verify fixes
Write-Host ""
Write-Host "[3/4] Verifying configuration fixes..." -ForegroundColor Yellow
$nextConfigContent = Get-Content "next.config.js" -Raw
if ($nextConfigContent -notmatch "appDir") {
    Write-Host "      ✅ next.config.js - deprecated appDir removed" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  next.config.js still has appDir" -ForegroundColor Red
}

if (Test-Path ".eslintrc.json") {
    Write-Host "      ✅ .eslintrc.json exists" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .eslintrc.json missing" -ForegroundColor Red
}

$loginPageContent = Get-Content "src\app\auth\login\page.tsx" -Raw
if ($loginPageContent -match "noValidate" -and $loginPageContent -match "console\.log") {
    Write-Host "      ✅ Login page has noValidate & debug logs" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Login page may need updates" -ForegroundColor Red
}

# Step 4: Instructions
Write-Host ""
Write-Host "[4/4] Ready to start!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS - PLEASE DO THESE:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start BACKEND in separate terminal:" -ForegroundColor Yellow
Write-Host "   cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Press ENTER to start FRONTEND..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Starting frontend development server..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT - After server starts:" -ForegroundColor Red
Write-Host "   1. Open http://localhost:3000/auth/login" -ForegroundColor Yellow
Write-Host "   2. Press F12 (DevTools)" -ForegroundColor Yellow
Write-Host "   3. Right-click refresh → 'Empty Cache and Hard Reload'" -ForegroundColor Yellow
Write-Host "   4. Check Console tab for debug logs (🔐 🚀 ❌ 🔴 🎯)" -ForegroundColor Yellow
Write-Host ""

npm run dev
