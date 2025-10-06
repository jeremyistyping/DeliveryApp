# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Mengantar** is a full-stack delivery aggregator web application for merchants to manage shipping orders across multiple couriers (JNE, TIKI, POS, SICEPAT, ANTERAJA, NINJA EXPRESS), track deliveries, handle COD payments, and generate reports.

### Tech Stack

- **Backend**: Node.js 20+ with TypeScript, Express.js, Prisma ORM, MySQL 8.x
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, TanStack Query (React Query)
- **Auth**: JWT-based authentication with role-based access control (RBAC)
- **Validation**: Zod schemas for both frontend and backend
- **PDF Generation**: PDFKit for shipping labels

### Repository Structure

```
mengantar-app/
├── backend/          # Express API server (port 4000)
│   ├── src/
│   │   ├── routes/       # API route handlers (auth, order, shipping, cod, return, report, merchant, owner)
│   │   ├── middleware/   # Auth, error handling, file upload
│   │   └── lib/          # JWT, PDF generation, Prisma client, utilities
│   └── prisma/       # Database schema and seed data
└── frontend/         # Next.js web app (port 3000)
    └── src/
        ├── app/          # Next.js App Router pages (admin, auth, dashboard, merchant, orders, track, user)
        ├── components/   # Reusable React components (Radix UI-based)
        ├── contexts/     # React context providers
        └── lib/          # API client, utilities, types

```

## Development Commands

### Initial Setup

```bash
# Create MySQL database first
# CREATE DATABASE mengantar_demo;

# Backend setup
cd backend
npm install
npm run db:generate     # Generate Prisma Client
npm run db:push         # Push schema to database
npm run db:seed         # Seed demo data

# Frontend setup
cd frontend
npm install
```

### Running Development Servers

```bash
# Backend (from backend/ directory)
npm run dev              # Start API server on port 4000

# Frontend (from frontend/ directory)
npm run dev              # Start Next.js dev server on port 3000
```

### Database Operations (Backend)

```bash
cd backend

npm run db:generate      # Generate Prisma Client after schema changes
npm run db:push          # Push schema changes to database (development)
npm run db:migrate       # Create and run migrations (production)
npm run db:seed          # Seed database with demo data
```

### Building

```bash
# Backend
cd backend
npm run build            # Compile TypeScript to dist/
npm start                # Run production build

# Frontend
cd frontend
npm run build            # Create production build
npm start                # Run production server
```

### Code Quality

```bash
# Backend
cd backend
npm run lint             # ESLint check
npm run typecheck        # TypeScript type checking

# Frontend
cd frontend
npm run lint             # Next.js ESLint check
npm run typecheck        # TypeScript type checking
```

## Architecture Overview

### Backend Architecture

The backend follows a standard Express.js REST API pattern with layered architecture:

- **Routes** (`src/routes/`): RESTful endpoint definitions organized by domain
  - `auth.ts`: Registration, login, profile completion
  - `order.ts`: Order CRUD, status updates, PDF label generation
  - `shipping.ts`: Rate calculation, tracking
  - `cod.ts`: COD record management and settlement
  - `return.ts`: Return request handling
  - `report.ts`: Sales, COD, shipping, returns reports
  - `merchant.ts`: Merchant-specific operations
  - `owner.ts`: Owner/admin operations
  
- **Middleware** (`src/middleware/`):
  - `auth.ts`: JWT authentication and role-based authorization
  - `errorHandler.ts`: Centralized error handling
  - `upload.ts`: Multer file upload configuration
  
- **Lib** (`src/lib/`):
  - `prisma.ts`: Singleton Prisma client instance
  - `jwt.ts`: Token generation and verification
  - `pdf.ts`: Shipping label PDF generation
  - `utils.ts`: Shared utility functions

- **Database**: Prisma ORM with MySQL
  - Schema includes: User, Merchant, Order, CODRecord, ReturnRequest, TrackingHistory
  - Supports RBAC with roles: MAIN_ADMIN, GENERAL_ADMIN, USER, MERCHANT

### Frontend Architecture

Next.js 14 App Router with server and client components:

- **App Router** (`src/app/`): File-based routing with nested layouts
  - `admin/`: Admin dashboard and management
  - `auth/`: Login and registration flows
  - `merchant/`: Merchant-specific views
  - `user/`: User dashboard
  - `orders/`: Order management (list, create, import)
  - `track/`: Order tracking interface
  
- **Components** (`src/components/`): Reusable UI components built with Radix UI primitives
  
- **Contexts** (`src/contexts/`): React context providers for global state (auth, user data)
  
- **Lib** (`src/lib/`): API client (axios), type definitions, utility functions

- **Data Fetching**: TanStack Query for server state management with optimistic updates
  
- **Forms**: React Hook Form with Zod validation schemas

### Key Architectural Patterns

1. **Monorepo Structure**: Separate frontend/backend with independent package.json files
   
2. **JWT Authentication Flow**:
   - Login returns JWT token stored in cookies
   - Middleware validates token and attaches user to request
   - Role-based access control checks user.role against route requirements
   
3. **Order Lifecycle**:
   - Create order → Generate order number → Calculate shipping rates
   - Confirm order → Generate PDF label
   - Update status → Track delivery
   - Handle COD settlement or return requests
   
4. **Multi-Courier Integration**:
   - Current implementation uses demo/simulated courier rates
   - Production requires replacing with actual courier API integrations
   - Rate checker compares prices across JNE, TIKI, POS, SICEPAT, ANTERAJA, NINJA EXPRESS
   
5. **RBAC System**:
   - Roles: MAIN_ADMIN (full access), GENERAL_ADMIN (operational), USER (view-only), MERCHANT
   - Middleware checks role permissions before allowing route access
   - Frontend conditionally renders UI based on user role

## Environment Configuration

### Backend `.env` (required)

```env
DATABASE_URL="mysql://root:password@localhost:3306/mengantar_demo"
JWT_SECRET="your_jwt_secret_key_here"
APP_BASE_URL="http://localhost:4000"
FRONTEND_ORIGIN="http://localhost:3000"
PORT=4000
NODE_ENV="development"
```

### Frontend `.env.local` (required)

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

## Demo Credentials

After running `npm run db:seed` in backend:
- **Email**: merchant1@example.com | **Password**: password123
- **Email**: merchant2@example.com | **Password**: password123

## Important Development Notes

### Demo vs Production

The current implementation includes **demo/simulated features**:
- Shipping rates use hardcoded logic instead of real courier APIs
- Tracking updates are simulated
- COD settlements are manual
- PDF labels use basic templates

**For production deployment**, you must:
- Integrate real courier APIs (JNE, TIKI, etc.)
- Implement webhook handlers for real-time tracking updates
- Add proper error logging and monitoring
- Configure automated database backups
- Implement rate limiting per merchant
- Setup email notifications
- Add proper CORS and security headers

### Path Aliases (Frontend)

The frontend uses TypeScript path aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/types/*` → `./src/types/*`

### API Response Format

All API responses follow a consistent structure:
- Success: `{ success: true, data: {...} }`
- Error: `{ success: false, error: "message" }`

### Database Schema Changes

After modifying `backend/prisma/schema.prisma`:
1. Run `npm run db:generate` to regenerate Prisma Client
2. Run `npm run db:push` (dev) or `npm run db:migrate` (production)
3. Restart the backend server
