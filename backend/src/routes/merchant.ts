import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = Router();

// Get merchant profile
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  res.json({
    success: true,
    data: merchant,
  });
}));

// Get merchant dashboard stats
router.get('/dashboard-stats', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  // Get order statistics
  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalRevenue,
    codPending,
    codSettled,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { merchantId: merchant.id },
    }),
    prisma.order.count({
      where: {
        merchantId: merchant.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.order.count({
      where: {
        merchantId: merchant.id,
        status: 'DELIVERED',
      },
    }),
    prisma.order.aggregate({
      where: { merchantId: merchant.id },
      _sum: { itemValue: true },
    }),
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
        status: 'PENDING',
      },
      _sum: { amount: true },
    }),
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
        status: 'SETTLED',
      },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        recipientName: true,
        status: true,
        shippingCost: true,
        createdAt: true,
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
      },
      revenue: {
        total: totalRevenue._sum.itemValue || 0,
      },
      cod: {
        pending: codPending._sum.amount || 0,
        settled: codSettled._sum.amount || 0,
      },
      recentOrders,
    },
  });
}));

// Get all merchants (admin only)
router.get('/', authenticate, authorize(['ADMIN']), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.merchant.count(),
  ]);

  res.json({
    success: true,
    data: merchants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

export default router;