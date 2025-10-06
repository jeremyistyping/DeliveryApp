# 🚀 QUICK GUIDE - User Management & Settings

## 📌 Akses Cepat

### Login Main Admin
```
URL: http://localhost:3000/auth/login
Email: mainadmin@delivery.com
Password: main123
```

---

## 👥 USER MANAGEMENT

### Cara Promote User

1. **Login sebagai Main Admin**
2. **Klik "All Users"** di sidebar
3. **Cari user** yang ingin di-promote (role harus USER)
4. **Klik icon 🛡️ (ShieldCheck)** di kolom Actions
5. **Pilih role baru:**
   - **General Admin** → Operational access
   - **Main Admin** → Full system access
6. **Selesai!** User akan langsung ter-promote

### Cara Deactivate Merchant

1. **Login sebagai Main Admin**
2. **Klik "All Users"** di sidebar
3. **Cari merchant** yang ingin di-deactivate
4. **Klik icon 🚫 (Ban)** di kolom Actions
5. **Merchant deactivated!**

### Cara Delete User

1. **Login sebagai Main Admin**
2. **Klik "All Users"** di sidebar
3. **Klik icon 🗑️ (Trash2)** pada user yang ingin dihapus
4. **Confirm** di modal yang muncul
5. **User deleted!**

### Cara Search User

1. **Ketik nama atau email** di search box (pojok kanan atas table)
2. **Results muncul real-time**

### Cara Filter by Role

1. **Pilih role** dari dropdown (ALL/MAIN_ADMIN/GENERAL_ADMIN/USER/MERCHANT)
2. **Table akan filter otomatis**

---

## ⚙️ SETTINGS

### Cara Change System Settings

1. **Login sebagai Main Admin**
2. **Klik "Settings"** di sidebar
3. **Edit fields yang diinginkan:**
   - System Name
   - Max Upload Size (MB)
   - Session Timeout (minutes)
4. **Klik "Save Settings"**

### Cara Toggle Notifications

1. **Scroll ke "Notification Settings"**
2. **Klik toggle switch:**
   - Email Notifications
   - SMS Notifications
3. **Klik "Save Settings"**

### Cara Enable/Disable Registration

1. **Scroll ke "Security & Access"**
2. **Toggle "Enable User Registration"**
3. **Klik "Save Settings"**

### Cara Enable Maintenance Mode

1. **Scroll ke "Security & Access"**
2. **Toggle "Maintenance Mode"** (akan merah saat aktif)
3. **Klik "Save Settings"**
⚠️ **Warning:** Ini akan temporarily disable system access!

### Cara Clear Cache

1. **Scroll ke "System Maintenance"**
2. **Klik "Clear Now"** button
3. **Cache cleared!**

### Cara Backup Database

1. **Scroll ke "System Maintenance"**
2. **Klik "Backup Now"** button
3. **Backup started!**

### Cara Reset Settings to Default

1. **Scroll ke bottom**
2. **Klik "Reset to Default"** button
3. **All settings kembali ke default**

---

## 🎯 Feature Highlights

### User Management
- ✅ **4 Statistics Cards** - Total Users, Admins, Regular Users, Merchants
- ✅ **Search** - Real-time search by name/email
- ✅ **Filter** - Filter by role
- ✅ **Promote** - Promote USER to GENERAL_ADMIN or MAIN_ADMIN
- ✅ **Deactivate** - Deactivate/activate merchant accounts
- ✅ **Delete** - Delete users with confirmation

### Settings
- ✅ **General Settings** - System name, upload limits, session timeout
- ✅ **Notifications** - Email & SMS toggles
- ✅ **Security** - Registration control, maintenance mode
- ✅ **Maintenance** - Auto backup, clear cache, manual backup

---

## 🔐 Access Levels

| Feature | Main Admin | General Admin | User |
|---------|:----------:|:-------------:|:----:|
| View Users | ✅ | ❌ | ❌ |
| Promote Users | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |
| Orders | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |

---

## 💡 Tips & Tricks

### User Management
- 🔍 **Cari cepat:** Gunakan search box untuk instant filtering
- 🎯 **Filter smart:** Gunakan role filter untuk melihat specific group
- ⚠️ **Self-protection:** Sistem prevent kamu delete/promote diri sendiri
- 🔄 **Auto refresh:** Data refresh otomatis setelah action

### Settings
- 💾 **Save regularly:** Jangan lupa click "Save Settings" setelah edit
- ⚡ **Quick toggle:** Click toggle switches untuk instant on/off
- 🔙 **Safe reset:** Gunakan "Reset to Default" jika settings error
- 🚨 **Maintenance mode:** Gunakan dengan hati-hati, akan disable access

---

## 🐛 Troubleshooting

### User Table Kosong
- ✅ Check backend sudah running di port 4000
- ✅ Check database sudah ada user data
- ✅ Refresh page (Ctrl+R)

### Cannot Promote User
- ✅ Check user role adalah USER (bukan admin)
- ✅ Check kamu login sebagai MAIN_ADMIN
- ✅ Check API backend running

### Settings Not Saving
- ✅ Check toast notification muncul
- ✅ Refresh page dan check settings persist
- ✅ Check console untuk errors

### Modal Not Appearing
- ✅ Check browser console untuk errors
- ✅ Refresh page
- ✅ Try different browser

---

## 📞 Quick Reference

### Keyboard Shortcuts
- `Ctrl + R` - Refresh page
- `Esc` - Close modal (if implemented)
- `Tab` - Navigate fields

### Color Codes
- 🔴 **Red** - Main Admin, Delete, Danger
- 🔵 **Blue** - General Admin, Primary actions
- 🟢 **Green** - Active, Success, Regular users
- 🟣 **Purple** - Merchants
- ⚪ **Gray** - Inactive, Neutral

### Icons Reference
- 🛡️ **ShieldCheck** - Promote user
- 🗑️ **Trash2** - Delete user
- 🚫 **Ban** - Deactivate
- ✅ **CheckCircle** - Activate
- 🔍 **Search** - Search users
- ⚙️ **Settings** - System settings
- 🔔 **Bell** - Notifications

---

## ✅ Quick Checklist

Before promoting user:
- [ ] User role is USER (not already admin)
- [ ] You are logged in as MAIN_ADMIN
- [ ] You know which role to promote to

Before deleting user:
- [ ] User is not yourself
- [ ] You have backup of important data
- [ ] You understand this is permanent

Before enabling maintenance mode:
- [ ] All users notified
- [ ] Necessary backups completed
- [ ] You know how to disable it

---

## 🎉 You're Ready!

Sekarang kamu sudah tahu cara menggunakan semua fitur User Management dan Settings!

**Happy Managing!** 🚀
