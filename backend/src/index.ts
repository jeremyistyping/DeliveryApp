import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import merchantRoutes from './routes/merchant';
import orderRoutes from './routes/order';
import shippingRoutes from './routes/shipping';
import codRoutes from './routes/cod';
import returnRoutes from './routes/return';
import reportRoutes from './routes/report';
import ownerRoutes from './routes/owner';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/cod', codRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/owner', ownerRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});