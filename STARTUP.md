# Cara Menjalankan Aplikasi Mengantar

## 📋 Persiapan Awal

### 1. Setup Database MySQL
Pastikan MySQL sudah terinstall dan buat database:
```sql
CREATE DATABASE mengantar_demo;
```

### 2. Setup Environment Files

**Backend** - Buat file `backend/.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/mengantar_demo"
JWT_SECRET="your_jwt_secret_key_here" 
APP_BASE_URL="http://localhost:4000"
FRONTEND_ORIGIN="http://localhost:3000"
PORT=4000
NODE_ENV="development"
```

**Frontend** - Buat file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

## 🚀 Menjalankan Aplikasi

### Terminal 1 - Backend (Port 4000)
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Terminal 2 - Frontend (Port 3000) 
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Login Demo
- **Email**: merchant1@example.com
- **Password**: password123

## 🌐 Akses Aplikasi
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## ✅ Status Checklist
- [ ] MySQL database `mengantar_demo` sudah dibuat
- [ ] File `backend/.env` sudah dibuat dengan DATABASE_URL yang benar
- [ ] File `frontend/.env.local` sudah dibuat
- [ ] Backend dependencies terinstall (`npm install` di folder backend)
- [ ] Frontend dependencies terinstall (`npm install` di folder frontend)
- [ ] Database schema sudah di-push (`npm run db:push` di backend)
- [ ] Database sudah di-seed dengan data demo (`npm run db:seed` di backend)
- [ ] Backend server berjalan di port 4000
- [ ] Frontend server berjalan di port 3000

## 🔧 Troubleshooting

**Database connection error:**
- Pastikan MySQL berjalan
- Cek DATABASE_URL di `backend/.env`
- Pastikan database `mengantar_demo` sudah dibuat

**Port sudah digunakan:**
- Matikan proses yang menggunakan port 3000/4000
- Atau ganti port di package.json

**Prisma Client error:**
- Jalankan `npm run db:generate` di folder backend
- Restart backend server