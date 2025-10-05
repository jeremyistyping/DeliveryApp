import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';

const router = Router();

// Get all merchants overview (OWNER only)
router.get('/merchants', authenticate, authorize(['OWNER', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
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
            createdAt: true,
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

  // Get additional stats for each merchant
  const merchantsWithStats = await Promise.all(
    merchants.map(async (merchant) => {
      const [totalRevenue, deliveredOrders, pendingCOD] = await Promise.all([
        prisma.order.aggregate({
          where: { merchantId: merchant.id },
          _sum: { itemValue: true },
        }),
        prisma.order.count({
          where: {
            merchantId: merchant.id,
            status: 'DELIVERED',
          },
        }),
        prisma.cODRecord.aggregate({
          where: {
            order: { merchantId: merchant.id },
            status: 'PENDING',
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        ...merchant,
        stats: {
          totalOrders: merchant._count.orders,
          deliveredOrders,
          totalRevenue: totalRevenue._sum.itemValue || 0,
          pendingCOD: pendingCOD._sum.amount || 0,
        },
      };
    })
  );

  res.json({
    success: true,
    data: merchantsWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// Get owner dashboard stats (OWNER only)
router.get('/dashboard-stats', authenticate, authorize(['OWNER', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const [
    totalMerchants,
    activeMerchants,
    totalOrders,
    totalRevenue,
    recentMerchants,
    topMerchants,
  ] = await Promise.all([
    prisma.merchant.count(),
    prisma.merchant.count({
      where: { isActive: true },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { itemValue: true, shippingCost: true },
    }),
    prisma.merchant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.merchant.findMany({
      take: 10,
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      merchants: {
        total: totalMerchants,
        active: activeMerchants,
      },
      orders: {
        total: totalOrders,
      },
      revenue: {
        totalItemValue: totalRevenue._sum.itemValue || 0,
        totalShipping: totalRevenue._sum.shippingCost || 0,
        total: (totalRevenue._sum.itemValue || 0) + (totalRevenue._sum.shippingCost || 0),
      },
      recentMerchants: recentMerchants.map(m => ({
        id: m.id,
        businessName: m.businessName,
        businessType: m.businessType,
        city: m.city,
        userName: m.user.name,
        email: m.user.email,
        createdAt: m.createdAt,
      })),
      topMerchants: topMerchants.map(m => ({
        id: m.id,
        businessName: m.businessName,
        city: m.city,
        totalOrders: m._count.orders,
      })),
    },
  });
}));

// Get merchant detail (OWNER/ADMIN only)
router.get('/merchants/:id', authenticate, authorize(['OWNER', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          recipientName: true,
          recipientCity: true,
          status: true,
          itemValue: true,
          createdAt: true,
        },
      },
    },
  });

  if (!merchant) {
    throw new AppError('Merchant not found', 404);
  }

  // Get merchant statistics
  const [totalOrders, totalRevenue, ordersByStatus, codStats] = await Promise.all([
    prisma.order.count({
      where: { merchantId: merchant.id },
    }),
    prisma.order.aggregate({
      where: { merchantId: merchant.id },
      _sum: { itemValue: true, shippingCost: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { merchantId: merchant.id },
      _count: true,
    }),
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      ...merchant,
      stats: {
        totalOrders,
        totalRevenue: (totalRevenue._sum.itemValue || 0) + (totalRevenue._sum.shippingCost || 0),
        ordersByStatus: ordersByStatus.map(s => ({
          status: s.status,
          count: s._count,
        })),
        cod: {
          totalAmount: codStats._sum.amount || 0,
          totalRecords: codStats._count,
        },
      },
    },
  });
}));

// Toggle merchant active status (ADMIN only)
router.patch('/merchants/:id/toggle-status', authenticate, authorize(['ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { id: req.params.id },
  });

  if (!merchant) {
    throw new AppError('Merchant not found', 404);
  }

  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      isActive: !merchant.isActive,
    },
  });

  res.json({
    success: true,
    data: updated,
    message: `Merchant ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
  });
}));

export default router;
