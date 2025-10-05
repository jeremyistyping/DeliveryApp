Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     STARTING BACKEND & FRONTEND     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
$backendRunning = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($backendRunning) {
    Write-Host "✅ Backend already running on port 5000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend NOT running!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting backend in NEW window..." -ForegroundColor Yellow
    
    # Start backend in new PowerShell window
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\backend; Write-Host 'Starting Backend...' -ForegroundColor Cyan; npm run dev"
    
    Write-Host "⏳ Waiting 5 seconds for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     STARTING FRONTEND     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📍 Location: C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT - After server starts:" -ForegroundColor Red
Write-Host ""
Write-Host "1️⃣  Open browser: http://localhost:3000/auth/login" -ForegroundColor Yellow
Write-Host "2️⃣  Press F12 (DevTools)" -ForegroundColor Yellow
Write-Host "3️⃣  Go to Console tab" -ForegroundColor Yellow
Write-Host "4️⃣  Press Ctrl+Shift+R (HARD REFRESH)" -ForegroundColor Yellow
Write-Host "5️⃣  Clear console (Ctrl+L)" -ForegroundColor Yellow
Write-Host "6️⃣  Try login with WRONG password" -ForegroundColor Yellow
Write-Host "7️⃣  CHECK CONSOLE for these logs:" -ForegroundColor Yellow
Write-Host "     🔐 Login attempt started" -ForegroundColor White
Write-Host "     🚀 Calling login API..." -ForegroundColor White
Write-Host "     ❌ Login error caught..." -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
