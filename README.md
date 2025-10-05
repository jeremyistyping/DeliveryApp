# Mengantar - Delivery Management System (DeliveryApp)

A full-stack delivery aggregator web application for merchants to manage shipping orders, track deliveries, handle COD payments, and generate reports.

## Features

- **Authentication & Authorization**: JWT-based auth system with merchant onboarding
- **Order Management**: Create, track, and manage shipping orders
- **Multi-Courier Support**: Integration with JNE, TIKI, POS, SICEPAT, ANTERAJA, NINJA EXPRESS
- **COD Management**: Handle Cash on Delivery payments and settlements
- **Returns Management**: Process return requests and track status
- **Shipping Rate Checker**: Compare rates across different couriers
- **PDF Label Generation**: Generate shipping labels for orders
- **Real-time Tracking**: Track order status and delivery updates
- **Reporting & Analytics**: Sales, shipping, COD, and returns reports
- **Dashboard**: Overview with key metrics and recent activities

## Tech Stack

### Backend
- **Node.js 20+** with TypeScript
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **MySQL 8.x** - Database
- **JWT** - Authentication
- **Zod** - Schema validation
- **PDFKit** - PDF generation
- **bcryptjs** - Password hashing

### Frontend
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** - Styling
- **TanStack Query (React Query)** - Data fetching
- **React Hook Form** - Form management
- **Radix UI** - UI components
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

## Project Structure

```
mengantar-app/
├── frontend/         # Next.js frontend (port 3000)
├── backend/          # Express.js backend (port 4000)
└── README.md
```

## Prerequisites

- Node.js 20+
- MySQL 8.x
- npm or pnpm

## Quick Start

### 1. Setup Database

Create a MySQL database:

```sql
CREATE DATABASE mengantar_demo;
```

### 2. Setup Backend (Terminal 1)

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

The backend will start on http://localhost:4000

### 3. Setup Frontend (Terminal 2)

```bash
cd frontend
npm install  
npm run dev
```

The frontend will start on http://localhost:3000

## Environment Configuration

### Backend (.env)
Create `backend/.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/mengantar_demo"
JWT_SECRET="your_jwt_secret_key_here"
APP_BASE_URL="http://localhost:4000"
FRONTEND_ORIGIN="http://localhost:3000"
PORT=4000
NODE_ENV="development"
```

### Frontend (.env.local)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

## Demo Credentials

Use these credentials to test the application:

- **Email**: merchant1@example.com
- **Password**: password123

Or:

- **Email**: merchant2@example.com  
- **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new merchant
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/complete-profile` - Complete merchant profile

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/:id/label` - Generate PDF label

### Shipping
- `POST /api/shipping/rates` - Get shipping rates
- `GET /api/shipping/track/:trackingNumber` - Track by number
- `GET /api/shipping/track/order/:orderId` - Track by order ID

### COD Management
- `GET /api/cod` - List COD records
- `GET /api/cod/summary` - COD summary
- `PATCH /api/cod/:id/status` - Update COD status
- `POST /api/cod/bulk-settle` - Bulk settle CODs

### Returns
- `GET /api/returns` - List returns
- `POST /api/returns` - Create return request
- `PATCH /api/returns/:id/status` - Update return status

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/cod` - COD report  
- `GET /api/reports/shipping` - Shipping report
- `GET /api/reports/returns` - Returns report

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all applications  
- `npm run lint` - Lint all workspaces
- `npm run typecheck` - Type check all workspaces

### Backend (apps/api)
- `npm run dev -w apps/api` - Start API development server
- `npm run build -w apps/api` - Build API
- `npm run db:push -w apps/api` - Push Prisma schema to database
- `npm run db:migrate -w apps/api` - Run Prisma migrations
- `npm run db:seed -w apps/api` - Seed database

### Frontend (apps/web) 
- `npm run dev -w apps/web` - Start Next.js development server
- `npm run build -w apps/web` - Build Next.js application

## Key Features Implementation

### Order Workflow
1. Merchant creates order with recipient details
2. System generates unique order number
3. Shipping rate calculation (demo rates or real API)
4. Order confirmation and PDF label generation
5. Real-time tracking updates
6. COD handling for cash payments
7. Return management if needed

### Authentication Flow
1. User registration/login
2. Merchant profile completion (onboarding)
3. JWT token management with auto-refresh
4. Protected routes and API endpoints

### Database Schema
The Prisma schema includes:
- Users and Merchants
- Orders with full lifecycle tracking  
- COD records with settlement status
- Return requests and processing
- Shipping rates and tracking history

## Development Notes

### Demo Features
- Shipping rates are calculated with demo logic
- Tracking updates use simulated data
- COD settlements are manual for demo purposes
- PDF labels are basic templates

### Production Considerations
- Replace demo shipping APIs with real courier integrations
- Implement webhook handlers for real-time tracking updates
- Add proper error logging and monitoring  
- Setup automated database backups
- Configure proper CORS and security headers
- Add rate limiting per merchant
- Implement email notifications

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **Port Already in Use**
   - Change ports in package.json scripts
   - Kill existing processes on ports 3000/4000

3. **Prisma Client Not Found**
   - Run `npm run db:generate -w apps/api`
   - Restart development server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## License

This project is licensed under the MIT License.
