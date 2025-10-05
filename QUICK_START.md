# 🚀 QUICK START - RBAC System Testing

## ✅ Setup Complete!

Database telah berhasil di-update dengan sistem RBAC baru!

## 🎯 Login Credentials

### 1. Main Admin (Full Access)
```
Email: mainadmin@delivery.com
Password: main123
Dashboard: /admin/dashboard
```
**Access:**
- ✅ Full system access
- ✅ Manage all users
- ✅ Manage admins
- ✅ System settings
- ✅ All reports & analytics

### 2. General Admin (Operational)
```
Email: admin1@delivery.com
Password: admin123
Dashboard: /admin/dashboard
```
**Access:**
- ✅ Operational access
- ✅ Manage orders & deliveries
- ✅ View reports
- ❌ Cannot manage users/admins
- ❌ Cannot access settings

### 3. Regular User (View Only)
```
Email: user@delivery.com
Password: user123
Dashboard: /user/dashboard
```
**Access:**
- ✅ Track deliveries
- ✅ Check tracking numbers
- ✅ View status
- ❌ No admin features
- ❌ Cannot edit anything

### 4. Demo Merchant (Legacy)
```
Email: merchant1@example.com
Password: password123
Dashboard: /merchant/dashboard (if exists)
```

## 🧪 Testing Scenarios

### Scenario 1: Main Admin Login
1. Open http://localhost:3000/auth/login
2. Login dengan mainadmin@delivery.com / main123
3. ✅ Should redirect to `/admin/dashboard`
4. ✅ Should see ALL menu items in sidebar:
   - Overview (with stats)
   - Orders
   - All Users 🔒
   - Admin Management 🔒
   - Reports
   - Settings 🔒
5. ✅ Click each menu - all should work
6. ✅ "Main Administrator" label should appear

### Scenario 2: General Admin Login
1. Logout dari Main Admin
2. Login dengan admin1@delivery.com / admin123
3. ✅ Should redirect to `/admin/dashboard`
4. ✅ Should see LIMITED menu items:
   - Overview (with stats)
   - Orders
   - Reports
5. ❌ Should NOT see:
   - All Users
   - Admin Management
   - Settings
6. ✅ "General Administrator" label should appear

### Scenario 3: Regular User Login
1. Logout dari General Admin
2. Login dengan user@delivery.com / user123
3. ✅ Should redirect to `/user/dashboard`
4. ✅ Should see simple tracking interface
5. ✅ Can enter tracking number (e.g., TK123456789)
6. ✅ Click "Track" button
7. ✅ Should show demo tracking result after 1 second
8. ❌ No admin features visible

### Scenario 4: Route Protection
While logged in as USER, try to access:
```
http://localhost:3000/admin/dashboard
```
✅ Should auto-redirect back to `/user/dashboard`

While logged in as GENERAL_ADMIN, try to access:
```
http://localhost:3000/user/dashboard
```
✅ Should auto-redirect back to `/admin/dashboard`

### Scenario 5: New User Registration
1. Logout
2. Go to http://localhost:3000/auth/register
3. Register new account:
   - Name: Test User
   - Email: testuser@example.com
   - Password: test123
4. ✅ Should redirect to `/auth/login`
5. Login with new credentials
6. ✅ Should redirect to `/user/dashboard` (default role = USER)

## 🔍 Visual Indicators

### Admin Dashboard
- **Sidebar**: Fixed left sidebar with role-based menu
- **Header**: Shows "Main Administrator" or "General Administrator"
- **Overview**: 4 stat cards + recent orders table
- **Color scheme**: Professional blue/gray theme

### User Dashboard
- **Header**: Clean header with "Delivery Tracking" title
- **Search**: Large search box with tracking number input
- **Results**: Card-based display of tracking info
- **Color scheme**: Simple, user-friendly theme
- **Info cards**: 3 cards at bottom (Status, Access, Support)

## 📊 Features Matrix

| Feature | Main Admin | General Admin | User |
|---------|:----------:|:-------------:|:----:|
| Dashboard Overview | ✅ Full | ✅ Full | ✅ Limited |
| Manage Orders | ✅ | ✅ | ❌ |
| View All Users | ✅ | ❌ | ❌ |
| Manage Admins | ✅ | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Track Deliveries | ✅ | ✅ | ✅ |

## 🎨 UI Differences

### Admin Dashboard UI
```
┌─────────────────────────────────────────────┐
│  [Sidebar]          │  [Main Content]       │
│  • Logo             │  • Header Bar         │
│  • Navigation       │  • Stats Cards        │
│  • Role Badge       │  • Recent Orders      │
│  • User Info        │  • Actions            │
│  • Logout Button    │                       │
└─────────────────────────────────────────────┘
```

### User Dashboard UI
```
┌─────────────────────────────────────────────┐
│  [Header Bar - Full Width]                  │
│  • Logo + Title                             │
│  • User Badge + Logout                      │
├─────────────────────────────────────────────┤
│  [Content - Centered]                       │
│  • Welcome Card                             │
│  • Search Box (Large)                       │
│  • Results Card (if searched)               │
│  • Info Cards (3 columns)                   │
└─────────────────────────────────────────────┘
```

## ⚡ Quick Commands

### Backend
```powershell
# Start backend server
cd backend
npm run dev
```

### Frontend
```powershell
# Start frontend server
cd frontend
npm run dev
```

### Database
```powershell
# Open Prisma Studio (GUI for database)
cd backend
npx prisma studio

# Re-seed database
npx prisma db seed

# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force
```

## 🎉 Success Criteria

All tests pass if:
- ✅ Each role redirects to correct dashboard
- ✅ Menu items visible/hidden based on role
- ✅ Route protection works (auto-redirect)
- ✅ New users get USER role by default
- ✅ UI looks clean and professional
- ✅ No console errors
- ✅ No hydration errors

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend is running (port 5000)
3. Verify frontend is running (port 3000)
4. Clear browser cookies
5. Check `RBAC_SYSTEM_GUIDE.md` for troubleshooting

## 🎊 Ready to Test!

Sekarang Anda bisa test 3 role yang berbeda dengan login credentials di atas.

**Recommendation:** Test dalam 3 browser/incognito windows berbeda untuk melihat perbedaan dashboard secara bersamaan!

Selamat mencoba! 🚀
