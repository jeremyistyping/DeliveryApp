# 🧪 Quick Test Guide - Persistent Notification Fix

## Prerequisites
Pastikan backend dan frontend sudah running:

### Terminal 1 - Backend
```bash
cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\backend
npm run dev
# Harus running di http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend
npm run dev
# Harus running di http://localhost:3000
```

## Test Scenarios

### ✅ Test 1: Wrong Password
1. Buka browser ke `http://localhost:3000/auth/login`
2. Input email: `merchant1@example.com`
3. Input password: `salahpassword`
4. Klik "Sign in"
5. **Expected Result:**
   - ✅ Error notification muncul di top-right
   - ✅ Notification TIDAK hilang otomatis
   - ✅ Halaman TIDAK refresh
   - ✅ Inline error alert (banner merah) muncul
   - ✅ Bisa klik X untuk dismiss notification
   - ✅ Inline alert tetap ada setelah dismiss notification

### ✅ Test 2: Empty Fields
1. Buka `http://localhost:3000/auth/login`
2. Kosongkan semua field
3. Klik "Sign in"
4. **Expected Result:**
   - ✅ Error notification "Please fill in all fields"
   - ✅ Notification persistent (tidak hilang)
   - ✅ Halaman tidak refresh

### ✅ Test 3: Invalid Email Format
1. Buka `http://localhost:3000/auth/login`
2. Input email: `bukan-email-valid`
3. Input password: `apasaja`
4. Klik "Sign in"
5. **Expected Result:**
   - ✅ Error notification "Please enter a valid email address"
   - ✅ Notification persistent
   - ✅ Halaman tidak refresh

### ✅ Test 4: Unregistered Email
1. Buka `http://localhost:3000/auth/login`
2. Input email: `tidakada@test.com`
3. Input password: `password123`
4. Klik "Sign in"
5. **Expected Result:**
   - ✅ Error notification "Account not found"
   - ✅ Notification persistent
   - ✅ Halaman tidak refresh

### ✅ Test 5: Successful Login
1. Buka `http://localhost:3000/auth/login`
2. Input email: `merchant1@example.com`
3. Input password: `password123`
4. Klik "Sign in"
5. **Expected Result:**
   - ✅ Success notification muncul (auto-dismiss setelah 3 detik)
   - ✅ Redirect ke dashboard/onboarding
   - ✅ No errors

### ✅ Test 6: Register - Passwords Don't Match
1. Buka `http://localhost:3000/auth/register`
2. Input name: `Test User`
3. Input email: `test@test.com`
4. Input password: `password123`
5. Input confirm password: `password456`
6. Klik "Create Account"
7. **Expected Result:**
   - ✅ Error notification "Passwords do not match"
   - ✅ Notification persistent
   - ✅ Halaman tidak refresh
   - ✅ Password mismatch indicator di bawah confirm password field

### ✅ Test 7: Register - Email Already Exists
1. Buka `http://localhost:3000/auth/register`
2. Input name: `Test User`
3. Input email: `merchant1@example.com` (already exists)
4. Input password: `password123`
5. Input confirm password: `password123`
6. Klik "Create Account"
7. **Expected Result:**
   - ✅ Error notification "Email already registered"
   - ✅ Notification persistent
   - ✅ Halaman tidak refresh

## Browser DevTools Check

### Console
Buka browser console (F12), pastikan TIDAK ada error seperti:
- ❌ Uncaught errors
- ❌ Warning tentang form validation
- ❌ Network errors (kecuali memang API call fail)

### Network Tab
1. Submit form dengan credentials salah
2. Check network tab:
   - ✅ Harus ada POST request ke `/api/auth/login`
   - ✅ Response 401 atau 404 (expected untuk wrong credentials)
   - ✅ TIDAK ada multiple requests atau page reload

## What to Look For

### ✅ GOOD Behavior
- Notification muncul dan TETAP visible
- User bisa baca pesan error dengan tenang
- Halaman tidak refresh/reload
- Form masih ada dan bisa diisi ulang
- Notification bisa di-dismiss dengan klik X
- Inline error alert (banner merah) tetap muncul

### ❌ BAD Behavior (should NOT happen)
- Notification hilang dalam < 1 detik
- Halaman refresh tiba-tiba
- Form hilang setelah error
- Multiple toasts muncul bersamaan
- Cannot dismiss notification

## Debug Commands

Jika masih ada masalah:

### Check Frontend
```bash
cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\frontend

# Restart development server
npm run dev

# Check for errors
npm run lint
```

### Check Backend
```bash
cd C:\Users\jeremia.kaligis\Desktop\mengantar-app\backend

# Restart server
npm run dev

# Check database connection
# Backend should log "MongoDB Connected" on startup
```

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

## Success Criteria

✅ All 7 test scenarios pass
✅ No console errors
✅ Notifications persistent on errors
✅ No page refresh on errors
✅ User can dismiss notifications manually
✅ Success login works and redirects properly

## Files Changed (for reference)

1. `frontend/src/app/layout.tsx` - Toaster config
2. `frontend/src/contexts/AuthContext.tsx` - Toast durations
3. `frontend/src/app/auth/login/page.tsx` - Form validation
4. `frontend/src/app/auth/register/page.tsx` - Form validation

## Need Help?

Jika masih ada issue:
1. Check console untuk errors
2. Verify backend sedang running
3. Clear browser cache
4. Restart frontend dev server
5. Check file `FIX_SUMMARY.md` untuk detail perubahan
