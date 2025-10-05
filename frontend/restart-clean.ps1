# Restart Frontend Development Server dengan Clean Cache
# Run this script jika perubahan belum ter-apply

Write-Host "🧹 Cleaning Next.js cache..." -ForegroundColor Yellow

# Stop any running Next.js processes (optional)
# Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force

# Clean Next.js cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Removed .next folder" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Setelah server start, di browser:" -ForegroundColor Yellow
Write-Host "   1. Tekan Ctrl+Shift+R (hard refresh)" -ForegroundColor Yellow
Write-Host "   2. Atau buka DevTools (F12) -> Network tab -> Centang 'Disable cache'" -ForegroundColor Yellow
Write-Host ""

npm run dev
