Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTARTING FRONTEND WITH CLEAN CACHE  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend

Write-Host "[1/3] Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "      ✅ .next folder removed" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
    Write-Host "      ✅ node_modules\.cache removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT STEPS AFTER SERVER STARTS:" -ForegroundColor Red
Write-Host "   1. Open browser to http://localhost:3000/auth/login" -ForegroundColor Yellow
Write-Host "   2. Press F12 to open DevTools" -ForegroundColor Yellow
Write-Host "   3. Right-click refresh button → 'Empty Cache and Hard Reload'" -ForegroundColor Yellow
Write-Host "   4. OR press Ctrl+Shift+R for hard refresh" -ForegroundColor Yellow
Write-Host ""
Write-Host "[3/3] Starting server now..." -ForegroundColor Yellow
Write-Host ""

npm run dev
