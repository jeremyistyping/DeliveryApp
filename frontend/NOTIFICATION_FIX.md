# Perbaikan Notifikasi Error - Persistent Error Notifications

## Masalah yang Diperbaiki

Sebelumnya, ketika login dengan credentials yang salah:
1. ✗ Notifikasi error muncul sebentar lalu hilang (auto-dismiss ~4 detik)
2. ✗ Halaman refresh secara tiba-tiba
3. ✗ User tidak punya cukup waktu untuk membaca pesan error

## Root Cause Analysis

### Masalah #1: Default Toast Duration di Layout
**File:** `frontend/src/app/layout.tsx`

Toaster component memiliki `toastOptions.duration: 4000` yang meng-override semua toast duration:
```typescript
// ❌ SEBELUM - Override semua duration
<Toaster
  toastOptions={{
    duration: 4000,  // ← Ini override duration: Infinity di AuthContext!
  }}
/>
```

### Masalah #2: HTML5 Form Validation
**File:** `frontend/src/app/auth/login/page.tsx`, `frontend/src/app/auth/register/page.tsx`

Input fields memiliki `required` attribute dan form tidak memiliki `noValidate`, menyebabkan:
- Browser trigger native validation
- Form submit sebelum JavaScript handler bisa prevent default
- Page refresh karena default form behavior

```html
<!-- ❌ SEBELUM -->
<form onSubmit={handleSubmit}>
  <input type="email" required ... />
  <input type="password" required ... />
</form>
```

## Solusi yang Diterapkan

### 1. **Toast Notification dengan Duration Infinity**
   - Error toast sekarang menggunakan `duration: Infinity`
   - User harus **manually dismiss** notifikasi dengan meng-klik tombol X atau di area lain
   - Notifikasi akan tetap muncul sampai user membuat keputusan

### 2. **Prevent Page Refresh**
   - Menambahkan `e.stopPropagation()` untuk mencegah event bubbling
   - Menggunakan `toast.dismiss()` untuk membersihkan notifikasi lama sebelum menampilkan yang baru
   - Menghapus `finally` block untuk `setLoading(false)` agar tidak conflict dengan navigation

### 3. **Improved Error State Management**
   - Error message disimpan di state lokal untuk tampilan inline alert
   - Error juga ditampilkan sebagai persistent toast
   - Error dari AuthContext sudah include status code detection

## File yang Diubah

### 1. `frontend/src/app/layout.tsx` ⭐ ROOT CAUSE FIX
**Masalah:** Default duration di Toaster meng-override semua individual toast settings

```typescript
// ✅ SESUDAH - Individual toasts control their own duration
<Toaster
  position="top-right"
  toastOptions={{
    // ❌ REMOVED: duration: 4000,  
    // ✅ Let individual toasts control duration
    style: {
      background: '#363636',
      color: '#fff',
    },
    success: {
      duration: 3000,  // ← Success default
    },
    error: {
      // ← No duration here, use individual toast duration
    },
  }}
/>
```

### 2. `frontend/src/contexts/AuthContext.tsx`
```typescript
// Login error handling - persistent toast
toast.error(errorMessage, {
  duration: Infinity,  // ← Tidak auto-dismiss
  style: {
    maxWidth: '500px',
  },
});

// Register error handling - persistent toast
toast.error(errorMessage, {
  duration: Infinity,  // ← Tidak auto-dismiss
  style: {
    maxWidth: '500px',
  },
});
```

### 3. `frontend/src/app/auth/login/page.tsx` ⭐ ROOT CAUSE FIX
```typescript
// ✅ SESUDAH
<form onSubmit={handleSubmit} noValidate> {/* ← noValidate mencegah browser validation */}
  <input 
    type="text"  {/* ← Bukan "email" agar tidak trigger browser validation */}
    // ❌ REMOVED: required
    value={email}
  />
  <input 
    type={showPassword ? "text" : "password"}
    // ❌ REMOVED: required
    value={password}
  />
</form>

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  e.stopPropagation(); // ← Prevent bubbling
  
  setError('');
  toast.dismiss(); // ← Clear old toasts
  
  // ... validations with persistent toasts
  
  try {
    setLoading(true);
    await login(email, password);
    // Navigation akan unmount component
  } catch (error: any) {
    // Set inline error
    setError(errorMessage);
    setLoading(false); // ← Manual reset, bukan di finally
  }
  // Tidak ada finally block
};
```

### 4. `frontend/src/app/auth/register/page.tsx`
- Implementasi yang sama seperti login page
- Menambahkan `noValidate` di form tag
- Menghapus semua `required` attributes dari inputs
- Mengubah `type="email"` menjadi `type="text"` untuk email field
- Semua validation error menggunakan persistent toast
- Form tidak akan refresh halaman

## Cara Kerja

1. **User submit form dengan data salah**
   ```
   ↓
   Form preventDefault & stopPropagation
   ↓
   Dismiss existing toasts
   ↓
   Validate input (client-side)
   ↓ (jika gagal)
   Show persistent error toast + inline alert
   ```

2. **API request gagal**
   ```
   ↓
   AuthContext catch error
   ↓
   Detect error type (401, 404, etc.)
   ↓
   Show persistent error toast
   ↓
   Throw error ke component
   ↓
   Component set inline error state
   ↓
   Loading state = false
   ```

3. **User membaca & dismiss notification**
   ```
   User klik X atau area lain
   ↓
   Toast dismissed
   ↓
   Inline alert masih tetap ada
   ↓
   User bisa mencoba lagi dengan data yang benar
   ```

## Testing Checklist

- [x] Login dengan email salah → Notifikasi tetap muncul
- [x] Login dengan password salah → Notifikasi tetap muncul
- [x] Login dengan email tidak terdaftar → Notifikasi tetap muncul
- [x] Register dengan email yang sudah ada → Notifikasi tetap muncul
- [x] Validation error (empty fields) → Notifikasi tetap muncul
- [x] Validation error (invalid email) → Notifikasi tetap muncul
- [x] Halaman tidak refresh saat error terjadi
- [x] User bisa dismiss notification secara manual
- [x] Inline alert tetap muncul setelah toast dismissed

## User Experience Flow

**Sebelum:**
```
User login salah → Error pop up 2 detik → Hilang → Halaman refresh → Bingung
```

**Sesudah:**
```
User login salah → Error muncul persistent → User baca pesan → 
User klik X untuk dismiss → Inline alert tetap ada → User perbaiki input → Submit lagi
```

## Catatan Penting

- Success notification tetap menggunakan auto-dismiss (3 detik) karena user akan di-redirect
- Error notification menggunakan persistent (Infinity duration) agar user punya waktu membaca
- Setiap kali submit baru, toast lama akan di-dismiss otomatis dengan `toast.dismiss()`
- Inline alert (banner merah) tetap ada untuk visual feedback tambahan
