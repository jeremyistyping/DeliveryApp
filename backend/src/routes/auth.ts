import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const merchantSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(2, 'Business type is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email format'),
});

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'MERCHANT',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
    message: 'User registered successfully',
  });
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      merchant: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        merchant: user.merchant,
      },
      token,
    },
    message: 'Login successful',
  });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      merchant: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      merchant: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
}));

// Complete merchant profile
router.post('/complete-profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchantData = merchantSchema.parse(req.body);

  // Check if merchant profile already exists
  const existingMerchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (existingMerchant) {
    throw new AppError('Merchant profile already exists', 409);
  }

  // Create merchant profile
  const merchant = await prisma.merchant.create({
    data: {
      ...merchantData,
      userId: req.user!.id,
    },
  });

  res.status(201).json({
    success: true,
    data: merchant,
    message: 'Merchant profile completed successfully',
  });
}));

// Update merchant profile
router.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchantData = merchantSchema.parse(req.body);

  const merchant = await prisma.merchant.update({
    where: { userId: req.user!.id },
    data: merchantData,
  });

  res.json({
    success: true,
    data: merchant,
    message: 'Profile updated successfully',
  });
}));

export default router;