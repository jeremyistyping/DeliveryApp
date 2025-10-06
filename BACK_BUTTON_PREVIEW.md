# ⬅️ BACK BUTTON - Visual Preview

## 🎨 Tampilan Sebelum & Sesudah

### BEFORE (Tanpa Back Button):
```
┌──────────────────────────────────────────────────────────────┐
│  Shipping                            John Doe      [Logout]  │
│  Check rates and track packages      MERCHANT                │
└──────────────────────────────────────────────────────────────┘
```

### AFTER (Dengan Back Button):
```
┌──────────────────────────────────────────────────────────────┐
│  [← Back]  Shipping                  John Doe      [Logout]  │
│            Check rates and track...  MERCHANT                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📸 Screenshot Ilustrasi

### 1. Shipping Page
```
╔════════════════════════════════════════════════════════════════╗
║  [← Back]  Shipping                  John Doe      [Logout]   ║
║            Check rates and track packages     MERCHANT        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌────────────────────┬────────────────────┐                  ║
║  │ 📦 Check Rates     │ 🔍 Track Package   │                  ║
║  └────────────────────┴────────────────────┘                  ║
║                                                                ║
║  Origin City:     [Jakarta              ]                     ║
║  Destination:     [Surabaya             ]                     ║
║  Weight (kg):     [1.5                  ]                     ║
║  Courier:         [JNE ▼                ]                     ║
║                                                                ║
║              [ Check Rates ]                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 2. COD Management Page
```
╔════════════════════════════════════════════════════════════════╗
║  [← Back]  COD Management            John Doe      [Logout]   ║
║            Manage cash on delivery payments    MERCHANT       ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     ║
║  │  ⏳      │  │  💰      │  │  📤      │  │  ✅      │     ║
║  │ Pending  │  │Collected │  │ Remitted │  │ Settled  │     ║
║  │ Rp 0     │  │ Rp 0     │  │ Rp 0     │  │ Rp 0     │     ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 3. Returns Management Page
```
╔════════════════════════════════════════════════════════════════╗
║  [← Back]  Returns Management        John Doe      [Logout]   ║
║            Manage return requests and processing   MERCHANT   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     ║
║  │  📋   │ │  ✅   │ │  ❌   │ │  🔄   │ │  ✔️   │     ║
║  │Request│ │Approved│ │Rejected│ │Progress│ │Complete│     ║
║  │   0   │ │   0    │ │   0    │ │   0    │ │   0    │     ║
║  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 4. Reports & Analytics Page
```
╔════════════════════════════════════════════════════════════════╗
║  [← Back]  Reports & Analytics       John Doe      [Logout]   ║
║            View detailed reports and insights      MERCHANT   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  From: [2024-01-01 ▼]  To: [2024-01-31 ▼]  [ Apply ]        ║
║                                                                ║
║  ┌────────────┬────────────┬────────────┬────────────┐       ║
║  │📊 Sales   │💰 COD      │🚚 Shipping │📦 Returns  │       ║
║  └────────────┴────────────┴────────────┴────────────┘       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Button States

### Default State:
```
┌──────────────┐
│ ← Back       │  ← Gray text (text-gray-600)
└──────────────┘     Gray background (transparent)
```

### Hover State:
```
┌──────────────┐
│ ← Back       │  ← Dark gray text (text-gray-900)
└──────────────┘     Light gray background (bg-gray-100)
    ↑ Hover effect dengan smooth transition
```

### Active/Click State:
```
┌──────────────┐
│ ← Back       │  ← Navigate to previous page
└──────────────┘     
    ↑ Router.back() executed
```

---

## 📐 Dimensions & Spacing

```
┌─────────────────────────────────────────────┐
│                                             │
│  [gap-4]                                    │
│    ↓                                        │
│  ┌────────────┐  ┌──────────────────┐     │
│  │ ← Back     │  │ Page Title       │     │
│  │            │  │ Description      │     │
│  └────────────┘  └──────────────────┘     │
│   px-3 py-2         Title: text-2xl       │
│   rounded-lg        Desc: text-sm         │
│                                             │
└─────────────────────────────────────────────┘
```

### Measurements:
- **Button padding:** `px-3 py-2` (12px horizontal, 8px vertical)
- **Gap between button & title:** `gap-4` (16px)
- **Icon size:** `w-5 h-5` (20x20px)
- **Border radius:** `rounded-lg` (8px)
- **Gap between icon & text:** `gap-2` (8px)

---

## 🎨 Color Palette

| State | Text Color | Background | Border |
|-------|-----------|------------|--------|
| **Default** | `#4B5563` (gray-600) | `transparent` | none |
| **Hover** | `#111827` (gray-900) | `#F3F4F6` (gray-100) | none |
| **Active** | `#111827` (gray-900) | `#E5E7EB` (gray-200) | none |

---

## 💻 Code Snippet

### Complete Implementation:
```tsx
// Import
import { useRouter } from 'next/navigation';

// In component
export default function YourPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            
            {/* LEFT SIDE: Back Button + Title */}
            <div className="flex items-center gap-4">
              {/* BACK BUTTON */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </button>
              
              {/* PAGE TITLE */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
                <p className="text-sm text-gray-500 mt-1">Page description</p>
              </div>
            </div>
            
            {/* RIGHT SIDE: User Info + Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Logout
              </button>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Rest of page content */}
    </div>
  );
}
```

---

## 📱 Mobile View

### Responsive Behavior:
```
Mobile (< 640px):
┌────────────────────────────┐
│ [← Back] Title    [Logout] │
│          Desc              │
│ User Info                  │
└────────────────────────────┘

Tablet (640px - 1024px):
┌──────────────────────────────────────┐
│ [← Back] Title          User [Logout]│
│          Description    Info         │
└──────────────────────────────────────┘

Desktop (> 1024px):
┌────────────────────────────────────────────┐
│ [← Back] Title            User Info [Logout]│
│          Description                       │
└────────────────────────────────────────────┘
```

---

## 🔄 Navigation Flow Example

### User Journey:
```
1. User Login
   ↓
2. Dashboard (Main)
   ↓
3. Click "Shipping" menu
   ↓
4. Shipping Page
   [← Back] Shipping
   ↓
5. Click "← Back" button
   ↓
6. Return to Dashboard ✅
```

### Multi-level Navigation:
```
Dashboard → Orders → Shipping (check rate)
                        ↓
                   [← Back]
                        ↓
                   Returns to Orders ✅
```

---

## ✨ Interactive Features

### On Hover:
1. **Cursor changes** to pointer (`cursor-pointer`)
2. **Background color** smoothly transitions to gray-100
3. **Text color** darkens to gray-900
4. **Scale effect** (optional): can add `hover:scale-105`

### On Click:
1. **Instant navigation** to previous page
2. **No page reload** (SPA navigation)
3. **Scroll position maintained** (if browser supports)
4. **State preserved** in previous page

---

## 🎯 Testing Guide

### Quick Test:
```bash
1. Start app: npm run dev
2. Login to dashboard
3. Navigate to /shipping
4. Observe: Back button visible ✅
5. Click Back button
6. Result: Returns to dashboard ✅
7. Repeat for /cod, /returns, /reports
```

### Visual Test Checklist:
- [ ] Arrow icon visible and properly aligned
- [ ] "Back" text legible
- [ ] Button has proper spacing from title
- [ ] Hover effect works smoothly
- [ ] Button responsive on mobile

### Functional Test Checklist:
- [ ] Clicking Back navigates to previous page
- [ ] Works from all 4 new pages
- [ ] No console errors
- [ ] Navigation is smooth (no flicker)
- [ ] Browser history maintained

---

## 🚀 Ready to Test!

Tombol Back sudah berhasil ditambahkan di semua 4 halaman:
- ✅ `/shipping` - Shipping Page
- ✅ `/cod` - COD Management
- ✅ `/returns` - Returns Management
- ✅ `/reports` - Reports & Analytics

**Silakan test dan nikmati navigasi yang lebih mudah!** 🎉
