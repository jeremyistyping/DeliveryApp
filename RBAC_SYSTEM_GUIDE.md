# Role-Based Access Control (RBAC) System - Implementation Guide

## 📋 Overview

Sistem RBAC dengan 3 tingkatan akses:
1. **MAIN_ADMIN** - Full access ke seluruh sistem
2. **GENERAL_ADMIN** - Operational access untuk mengelola deliveries
3. **USER** - Limited access untuk tracking dan view status saja

## 🎯 Akun Yang Dibuat

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Main Admin** | mainadmin@delivery.com | main123 | Full system access, manage users & admins, settings |
| **General Admin** | admin1@delivery.com | admin123 | Operational access, manage deliveries & reports |
| **Regular User** | user@delivery.com | user123 | View only - track deliveries, check tracking numbers |
| ~~Merchant~~ | ~~merchant1@example.com~~ | ~~password123~~ | Removed (replaced with Main Admin) |

## 🔧 Perubahan Yang Dilakukan

### 1. Backend Changes

#### A. `backend/prisma/schema.prisma`
**Perubahan Enum Role:**
```prisma
enum Role {
  MAIN_ADMIN      // Full access to everything
  GENERAL_ADMIN   // Operational access
  USER            // Limited access - view only
  MERCHANT        // Keep for backward compatibility
  ADMIN           // Keep for backward compatibility
  OWNER           // Keep for backward compatibility
}
```

**Perubahan Default Role User:**
```prisma
model User {
  ...
  role  Role  @default(USER)  // Changed from MERCHANT to USER
  ...
}
```

#### B. `backend/prisma/seed.ts`
**Akun Baru yang Dibuat:**
- Main Admin (mainadmin@delivery.com)
- General Admin (admin1@delivery.com)
- Regular User (user@delivery.com)
- Demo Merchants (tetap ada untuk backward compatibility)

### 2. Frontend Changes

#### A. `frontend/src/contexts/AuthContext.tsx`
**Role-Based Redirect Logic:**
```typescript
if (userData.role === 'MAIN_ADMIN' || userData.role === 'GENERAL_ADMIN') {
  router.push('/admin/dashboard');
} else if (userData.role === 'USER') {
  router.push('/user/dashboard');
} else if (userData.role === 'MERCHANT') {
  router.push('/merchant/dashboard');
}
```

#### B. `frontend/src/middleware.ts` (NEW)
Middleware untuk protect routes berdasarkan role:
- Admin hanya bisa akses `/admin/*`
- User hanya bisa akses `/user/*`
- Merchant hanya bisa akses `/merchant/*`
- Auto-redirect jika user mencoba akses route yang tidak sesuai role

#### C. Dashboards (NEW)

**1. User Dashboard** - `frontend/src/app/user/dashboard/page.tsx`
- ✅ Track deliveries by tracking number
- ✅ View delivery status
- ✅ Simple, clean interface
- ❌ No editing capabilities
- ❌ No admin features

**2. Admin Dashboard** - `frontend/src/app/admin/dashboard/page.tsx`
- ✅ Overview with stats (orders, users, revenue)
- ✅ Recent orders table
- ✅ Navigation sidebar
- ✅ Role-specific features:
  - **Main Admin Only**: User Management, Admin Management, Settings
  - **Both Admins**: Overview, Orders, Reports

## 🚀 Setup Instructions

### Step 1: Reset Database & Run Migrations

```powershell
# Navigate to backend folder
cd backend

# Reset database (WARNING: This will delete all existing data)
npx prisma migrate reset --force

# This command will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Run the seed file automatically
```

### Step 2: Verify Seeded Data

```powershell
# Still in backend folder
npx prisma studio

# This will open Prisma Studio in your browser
# Verify that the following users exist:
# - mainadmin@delivery.com (MAIN_ADMIN)
# - admin1@delivery.com (GENERAL_ADMIN)
# - user@delivery.com (USER)
```

### Step 3: Restart Backend Server

```powershell
# In backend folder
npm run dev
```

### Step 4: Restart Frontend Server

```powershell
# In frontend folder
cd ../frontend
npm run dev
```

## 🧪 Testing Guide

### Test 1: Main Admin Access
```
URL: http://localhost:3000/auth/login
Email: mainadmin@delivery.com
Password: main123

Expected:
✅ Login successful
✅ Redirect to /admin/dashboard
✅ Can see ALL menu items:
   - Overview
   - Orders
   - All Users (Main Admin only)
   - Admin Management (Main Admin only)
   - Reports
   - Settings (Main Admin only)
✅ Can access all sections
```

### Test 2: General Admin Access
```
Email: admin1@delivery.com
Password: admin123

Expected:
✅ Login successful
✅ Redirect to /admin/dashboard
✅ Can see LIMITED menu items:
   - Overview
   - Orders
   - Reports
   (NO Users, Admin Management, or Settings)
✅ Cannot access Main Admin features
```

### Test 3: Regular User Access
```
Email: user@delivery.com
Password: user123

Expected:
✅ Login successful
✅ Redirect to /user/dashboard
✅ Simple tracking interface
✅ Can enter tracking number and search
✅ View-only access
❌ Cannot access admin features
```

### Test 4: New Account Registration
```
Register new account with any email

Expected:
✅ Account created
✅ Redirect to /auth/login (not auto-login)
✅ After login, user gets USER role by default
✅ Redirect to /user/dashboard
```

### Test 5: Route Protection
Try accessing admin dashboard while logged in as USER:
```
URL: http://localhost:3000/admin/dashboard

Expected:
❌ Access denied
✅ Auto-redirect to /user/dashboard
```

## 📁 File Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # ✏️ Modified (added roles)
│   └── seed.ts                # ✏️ Modified (new accounts)

frontend/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   │       └── page.tsx   # ✨ NEW (Admin Dashboard)
│   │   ├── user/
│   │   │   └── dashboard/
│   │   │       └── page.tsx   # ✨ NEW (User Dashboard)
│   │   └── auth/
│   │       ├── login/...      # ✏️ Modified (from previous fixes)
│   │       └── register/...   # ✏️ Modified (from previous fixes)
│   ├── contexts/
│   │   └── AuthContext.tsx    # ✏️ Modified (role-based redirect)
│   └── middleware.ts          # ✨ NEW (route protection)
```

## 🔐 Role Permissions Matrix

| Feature | MAIN_ADMIN | GENERAL_ADMIN | USER |
|---------|:----------:|:-------------:|:----:|
| View Dashboard | ✅ | ✅ | ✅ |
| Track Deliveries | ✅ | ✅ | ✅ |
| View Orders | ✅ | ✅ | ❌ |
| Manage Orders | ✅ | ✅ | ❌ |
| View All Users | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Admins | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |

## 🎨 Dashboard Features

### Main Admin Dashboard
- **Overview Tab**: Stats cards, recent orders table
- **Orders Tab**: Full order management
- **All Users Tab**: View and manage all users
- **Admin Management Tab**: Add/edit/remove admin accounts
- **Reports Tab**: Analytics and reports
- **Settings Tab**: System configuration

### General Admin Dashboard
- **Overview Tab**: Stats cards, recent orders table (same as Main Admin)
- **Orders Tab**: Full order management
- **Reports Tab**: Analytics and reports
- ❌ No access to: Users, Admin Management, Settings

### User Dashboard
- **Track Package**: Simple search by tracking number
- **View Status**: Real-time delivery status
- **Info Cards**: Quick access info
- ❌ No admin features

## ⚠️ Important Notes

1. **Default Role for New Users**: Semua akun baru yang register akan mendapat role `USER` secara default
2. **Admin Creation**: Hanya Main Admin yang bisa membuat akun admin baru (belum diimplementasi fully)
3. **Route Protection**: Middleware akan otomatis redirect user ke dashboard yang sesuai dengan role mereka
4. **Backward Compatibility**: Role `MERCHANT`, `ADMIN`, `OWNER` tetap ada untuk compatibility
5. **Database Reset**: Command `prisma migrate reset` akan **menghapus semua data**, pastikan backup dulu jika ada data penting

## 🐛 Troubleshooting

### Error: "Role 'MAIN_ADMIN' does not exist"
```powershell
# Run migration
cd backend
npx prisma migrate dev --name add_new_roles
npx prisma generate
```

### Error: "User not found" saat login
```powershell
# Re-run seed
cd backend
npx prisma db seed
```

### Frontend tidak redirect dengan benar
```powershell
# Clear browser cookies
# Restart frontend server
cd frontend
npm run dev
```

## 📝 Next Steps

1. ✅ Database schema updated
2. ✅ Seed file updated
3. ✅ AuthContext updated
4. ✅ Dashboards created
5. ✅ Middleware added
6. 🔄 **TODO**: Implement user management UI
7. 🔄 **TODO**: Implement admin management UI
8. 🔄 **TODO**: Connect to real API endpoints

## 🎉 Summary

Sistem RBAC dengan 3 role telah berhasil diimplementasikan:
- ✅ Main Admin: Full access
- ✅ General Admin: Operational access
- ✅ User: View-only access
- ✅ Route protection via middleware
- ✅ Role-based redirect
- ✅ Clean dashboards for each role

Silakan test dengan 3 akun yang telah dibuat!
