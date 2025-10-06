# 🧪 TEST NEW FEATURES - Quick Guide

## ✅ Verifikasi File Sudah Dibuat

Pastikan semua file berikut ada:
- ✅ `frontend/src/app/shipping/page.tsx`
- ✅ `frontend/src/app/cod/page.tsx`
- ✅ `frontend/src/app/returns/page.tsx`
- ✅ `frontend/src/app/reports/page.tsx`

## 🚀 Langkah Testing

### 1. Jalankan Aplikasi

#### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```
**Expected:** Backend running di `http://localhost:4000`

#### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```
**Expected:** Frontend running di `http://localhost:3000`

---

### 2. Login ke Aplikasi

Buka browser: `http://localhost:3000/auth/login`

**Test Credentials:**
```
Email: mainadmin@delivery.com
Password: main123
```
atau
```
Email: merchant1@example.com
Password: password123
```

**Expected:** Redirect ke dashboard sesuai role

---

### 3. Test Shipping Page

**URL:** `http://localhost:3000/shipping`

#### Test Rate Checker (Tab 1)
1. ✅ Klik tab "📦 Check Rates"
2. ✅ Isi form:
   - Origin: Jakarta
   - Destination: Surabaya
   - Weight: 1.5
   - Courier: JNE
3. ✅ Klik "Check Rates"
4. ✅ **Expected:** Muncul list services dengan harga dan ETD

#### Test Tracking (Tab 2)
1. ✅ Klik tab "🔍 Track Package"
2. ✅ Input tracking number: `TK123456789`
3. ✅ Klik "Track Package"
4. ✅ **Expected:** 
   - Muncul tracking number
   - Status ditampilkan
   - History timeline muncul (jika ada data)

**Note:** Jika error "Failed to fetch rates" atau "Failed to track", ini normal karena backend mungkin menampilkan demo data atau endpoint belum fully implemented.

---

### 4. Test COD Management Page

**URL:** `http://localhost:3000/cod`

#### Test Summary Cards
1. ✅ **Expected:** Lihat 4 cards:
   - Total Pending
   - Total Collected
   - Total Remitted
   - Total Settled

#### Test Table & Filters
1. ✅ Coba filter dropdown (ALL, PENDING, COLLECTED, dll)
2. ✅ **Expected:** Table update sesuai filter
3. ✅ Jika ada data, coba:
   - Checkbox select
   - Bulk selection (select all)
   - Click action buttons (Mark Collected, Mark Remitted, dll)

#### Test Bulk Settle
1. ✅ Select beberapa COD records
2. ✅ Klik "Settle Selected"
3. ✅ **Expected:** Confirmation toast & data refresh

**Note:** Jika table kosong, ini normal jika belum ada COD orders di database.

---

### 5. Test Returns Management Page

**URL:** `http://localhost:3000/returns`

#### Test Stats Cards
1. ✅ **Expected:** Lihat 5 cards:
   - Requested
   - Approved
   - Rejected
   - In Progress
   - Completed

#### Test Create Return
1. ✅ Klik button "+ New Return Request"
2. ✅ **Expected:** Modal muncul
3. ✅ Isi form:
   - Order ID: (any order ID from your database)
   - Return Reason: "Product damaged"
4. ✅ Klik "Create Return"
5. ✅ **Expected:** Success toast & table refresh

#### Test Status Updates
1. ✅ Jika ada return dengan status REQUESTED:
   - Klik "Approve" atau "Reject"
2. ✅ Jika ada status APPROVED:
   - Klik "Start Processing"
3. ✅ Jika ada status IN_PROGRESS:
   - Klik "Complete"
4. ✅ **Expected:** Status berubah & toast notification

**Note:** Jika create return error, pastikan Order ID valid dari database.

---

### 6. Test Reports & Analytics Page

**URL:** `http://localhost:3000/reports`

#### Test Date Range
1. ✅ Ubah date range (From & To)
2. ✅ Klik "Apply"
3. ✅ **Expected:** Report data refresh

#### Test Sales Report (Tab 1)
1. ✅ Klik tab "📊 Sales Report"
2. ✅ **Expected:** Lihat:
   - 4 metric cards (Total Orders, Revenue, Avg Value, Completed)
   - Progress bars showing orders by status

#### Test COD Report (Tab 2)
1. ✅ Klik tab "💰 COD Report"
2. ✅ **Expected:** Lihat:
   - 4 COD metric cards
   - COD Summary table

#### Test Shipping Report (Tab 3)
1. ✅ Klik tab "🚚 Shipping Report"
2. ✅ **Expected:** Lihat:
   - 3 shipping metric cards
   - Shipments by Courier (progress bars)

#### Test Returns Report (Tab 4)
1. ✅ Klik tab "📦 Returns Report"
2. ✅ **Expected:** Lihat:
   - 4 return metric cards
   - Top Return Reasons (progress bars)

**Note:** Jika data kosong atau error, ini normal jika database belum punya cukup data.

---

## 🎯 Success Criteria

### Visual Check ✅
- [ ] Semua halaman load tanpa error
- [ ] Header muncul dengan user info
- [ ] Logout button works
- [ ] Cards & tables tampil dengan proper styling
- [ ] Colors sesuai (blue, green, yellow, red, purple)
- [ ] Icons muncul (emoji icons)

### Functionality Check ✅
- [ ] Forms dapat diisi & submit
- [ ] Buttons clickable & responsive
- [ ] Toast notifications muncul
- [ ] Loading states tampil saat fetching
- [ ] Empty states tampil jika no data
- [ ] Tabs navigation works
- [ ] Filters & dropdowns works

### Responsive Check ✅
- [ ] Test di desktop (full width)
- [ ] Test di tablet (medium width)
- [ ] Test di mobile (small width)
- [ ] Tables scroll horizontal di mobile
- [ ] Cards stack vertically di mobile

---

## 🐛 Troubleshooting

### Issue: Page shows 404
**Solution:**
1. Restart frontend server: `npm run dev`
2. Clear browser cache: Ctrl+Shift+R
3. Check file path: `frontend/src/app/[page-name]/page.tsx`

### Issue: API Error / Failed to fetch
**Solution:**
1. Check backend is running: `http://localhost:4000/health`
2. Check browser console for errors
3. Verify API endpoints in `frontend/src/lib/api.ts`
4. Some endpoints might need actual data in database

### Issue: No data showing
**Solution:**
1. Run database seed: `cd backend && npm run db:seed`
2. Create sample data manually via other pages
3. This is normal for fresh database

### Issue: TypeScript errors
**Solution:**
1. Run type check: `npm run typecheck`
2. If errors, check imports & types
3. Restart TypeScript server in IDE

### Issue: Styling broken
**Solution:**
1. Check Tailwind CSS is running
2. Restart frontend: `npm run dev`
3. Clear `.next` cache: Delete `frontend/.next` folder

---

## 📊 Testing Checklist

### Shipping Page
- [ ] Rate checker form works
- [ ] All courier options available
- [ ] Tracking form works
- [ ] Tab switching works
- [ ] Loading states appear
- [ ] Error messages clear

### COD Page
- [ ] Summary cards display
- [ ] Table loads data
- [ ] Filters work
- [ ] Checkbox selection works
- [ ] Status updates work
- [ ] Bulk settle works

### Returns Page
- [ ] Stats cards display
- [ ] Create modal opens
- [ ] Create form submits
- [ ] Table loads data
- [ ] Status workflow works
- [ ] Filters work

### Reports Page
- [ ] Date range selector works
- [ ] All 4 tabs accessible
- [ ] Each report shows metrics
- [ ] Progress bars render
- [ ] Data tables work
- [ ] No console errors

---

## 🎉 Success!

Jika semua test case di atas pass, congratulations! 🎊

**Fitur yang berhasil:**
- ✅ Shipping (Rate Checker + Tracking)
- ✅ COD Management
- ✅ Returns Management  
- ✅ Reports & Analytics

**Total features:** 4 pages, 15+ features

---

## 📞 Support

Jika ada issues:
1. Check browser console (F12)
2. Check backend logs
3. Review `NEW_FEATURES_IMPLEMENTED.md`
4. Verify database has data
5. Restart both servers

**Happy Testing!** 🚀
