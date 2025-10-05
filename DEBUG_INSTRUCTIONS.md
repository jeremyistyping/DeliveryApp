# 🔍 Debug Instructions - Persistent Notification Issue

## CRITICAL: Follow These Steps EXACTLY

### Step 1: Stop Current Dev Server
1. Di terminal yang menjalankan `npm run dev` (frontend)
2. Tekan `Ctrl + C` untuk stop server
3. Tunggu sampai benar-benar berhenti

### Step 2: Clean Cache & Restart
Pilih salah satu cara:

#### Option A: Manual Clean (Recommended)
```powershell
cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend

# Clean Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Start dev server
npm run dev
```

#### Option B: Use Script
```powershell
cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend
.\restart-clean.ps1
```

### Step 3: Clear Browser Completely

#### Chrome/Edge:
1. Tekan `F12` untuk buka DevTools
2. **IMPORTANT:** Klik kanan pada refresh button (di address bar)
3. Pilih **"Empty Cache and Hard Reload"**
4. ATAU tekan `Ctrl + Shift + Delete`:
   - Centang "Cached images and files"
   - Centang "Cookies and site data"
   - Time range: "All time"
   - Click "Clear data"

#### Firefox:
1. Tekan `F12` untuk buka DevTools
2. Pergi ke Network tab
3. Centang "Disable Cache"
4. Tekan `Ctrl + F5` (hard refresh)

### Step 4: Test dengan Console Open

1. **Buka** `http://localhost:3000/auth/login`
2. **Open DevTools** (`F12`)
3. **Pergi ke Console tab**
4. **Clear console** (klik icon trash atau Ctrl+L)

### Step 5: Test Login dengan Credentials Salah

1. Email: `merchant1@example.com`
2. Password: `wrongpassword` (sengaja salah)
3. Klik "Sign in"

### Step 6: Check Console Logs

Anda harus melihat log seperti ini:
```
🔐 Login attempt started
🚀 Calling login API...
❌ Login error caught: [error object]
🔴 Showing persistent error toast: Invalid email or password
🎯 Toast ID: [some-id] | Duration: Infinity
```

### Step 7: Observe Behavior

**✅ EXPECTED (CORRECT) Behavior:**
- [ ] Console menampilkan semua log di atas
- [ ] Error notification muncul di top-right
- [ ] Notification **TIDAK hilang** otomatis
- [ ] Halaman **TIDAK refresh**
- [ ] URL tetap `/auth/login` (tidak berubah)
- [ ] Inline error alert (banner merah) muncul
- [ ] Ada tombol X di notification untuk dismiss
- [ ] Form masih bisa diisi ulang

**❌ BAD (PROBLEM) Behavior:**
- [ ] Console tidak menampilkan log
- [ ] Notification hilang < 1 detik
- [ ] Halaman refresh
- [ ] URL berubah atau reload
- [ ] Console menampilkan error

### Step 8: Check Network Tab

1. Pergi ke **Network tab** di DevTools
2. Submit form lagi dengan credentials salah
3. **Check:**
   - [ ] Ada POST request ke `http://localhost:5000/api/auth/login`?
   - [ ] Response status: `401 Unauthorized` atau `404`?
   - [ ] TIDAK ada multiple requests yang sama?
   - [ ] TIDAK ada request ke `/auth/login` (yang akan trigger page reload)?

### Step 9: Test Notification Dismiss

Jika notification muncul dan tetap:
1. Hover mouse ke notification
2. Klik tombol **X** di pojok kanan atas notification
3. Notification harus hilang
4. Inline error alert (banner merah) harus **tetap ada**

## Troubleshooting

### Problem: Console log tidak muncul
**Cause:** Dev server belum restart atau browser cache
**Solution:** 
1. Stop dev server (Ctrl+C)
2. Clean cache (langkah 2)
3. Restart server
4. Hard reload browser (Ctrl+Shift+R)

### Problem: Notification masih hilang cepat
**Cause:** Browser extension (password manager)
**Solution:**
1. Open browser in Incognito/Private mode
2. Test lagi di incognito window
3. Jika works di incognito = extension interfere

### Problem: Halaman masih refresh
**Cause:** Form masih trigger default submission
**Solution:**
Check console untuk errors. Kalau ada error di `handleSubmit`, form bisa fallback ke default behavior.

### Problem: Warning "fdprocessedid"
**Cause:** Password manager extension (LastPass, 1Password, dll)
**Solution:** 
- **Safe to ignore** - ini cuma warning, bukan error
- Atau test di Incognito mode without extensions

## Report Back

Please screenshot atau copy-paste:

1. ✅ **Console logs** setelah klik "Sign in"
2. ✅ **Network tab** - screenshot request/response
3. ✅ **Screenshot** notification behavior
4. ✅ Apakah halaman refresh? (Yes/No)
5. ✅ Apakah notification persist? (Yes/No)
6. ✅ Browser dan version (Chrome 120, Firefox 121, dll)
7. ✅ Apakah ada browser extensions installed?

## Expected Console Output

```
🔐 Login attempt started
🚀 Calling login API...
POST http://localhost:5000/api/auth/login 401 (Unauthorized)
Login error: Object { response: {...}, message: "..." }
❌ Login error caught: [Error object with response.status = 401]
🔴 Showing persistent error toast: Invalid email or password
🎯 Toast ID: toast-123-xyz | Duration: Infinity
```

## Success Criteria

✅ All console logs appear
✅ Network request shows 401/404 (expected for wrong credentials)
✅ Notification appears and STAYS visible
✅ NO page refresh/reload
✅ Can click X to dismiss notification
✅ Inline error alert remains after dismiss

---

**NOTE:** Jika semua langkah sudah diikuti tapi masih bermasalah, please provide:
- Console logs (screenshot atau copy)
- Network tab screenshot
- Browser name & version
- List of installed extensions
