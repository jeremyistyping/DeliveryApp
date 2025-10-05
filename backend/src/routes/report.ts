import { Router } from 'express';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Get sales report
router.get('/sales', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = { merchantId: merchant.id };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }

  const [
    totalOrders,
    totalRevenue,
    totalShippingCost,
    ordersByStatus,
    ordersByMonth,
    topDestinations,
    courierUsage,
  ] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.aggregate({
      where: whereClause,
      _sum: { itemValue: true },
    }),
    prisma.order.aggregate({
      where: whereClause,
      _sum: { shippingCost: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    }),
    prisma.order.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: true,
      _sum: { itemValue: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.order.groupBy({
      by: ['recipientCity'],
      where: whereClause,
      _count: true,
      orderBy: { _count: { recipientCity: 'desc' } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['courier'],
      where: whereClause,
      _count: true,
      _sum: { shippingCost: true },
      orderBy: { _count: { courier: 'desc' } },
    }),
  ]);

  // Process monthly data
  const monthlyData = ordersByMonth.map(item => ({
    month: item.createdAt.toISOString().substring(0, 7), // YYYY-MM format
    orders: item._count,
    revenue: item._sum.itemValue || 0,
  }));

  res.json({
    success: true,
    data: {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.itemValue || 0,
        totalShippingCost: totalShippingCost._sum.shippingCost || 0,
        averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.itemValue || 0) / totalOrders : 0,
      },
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      monthlyTrends: monthlyData,
      topDestinations: topDestinations.map(item => ({
        city: item.recipientCity,
        orders: item._count,
      })),
      courierUsage: courierUsage.map(item => ({
        courier: item.courier,
        orders: item._count,
        totalShippingCost: item._sum.shippingCost || 0,
      })),
    },
  });
}));

// Get COD report
router.get('/cod', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = {
    order: { merchantId: merchant.id },
  };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }

  const [
    totalCOD,
    codByStatus,
    avgSettlementTime,
    recentCODs,
  ] = await Promise.all([
    prisma.cODRecord.aggregate({
      where: whereClause,
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cODRecord.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
      _sum: { amount: true },
    }),
    prisma.cODRecord.findMany({
      where: {
        ...whereClause,
        status: 'SETTLED',
        createdAt: { not: null },
        settledAt: { not: null },
      },
      select: {
        createdAt: true,
        settledAt: true,
      },
    }),
    prisma.cODRecord.findMany({
      where: whereClause,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            recipientName: true,
            status: true,
          },
        },
      },
    }),
  ]);

  // Calculate average settlement time
  let avgDays = 0;
  if (avgSettlementTime.length > 0) {
    const totalDays = avgSettlementTime.reduce((sum, record) => {
      if (record.settledAt && record.createdAt) {
        const diffTime = record.settledAt.getTime() - record.createdAt.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }
      return sum;
    }, 0);
    avgDays = totalDays / avgSettlementTime.length;
  }

  res.json({
    success: true,
    data: {
      overview: {
        totalAmount: totalCOD._sum.amount || 0,
        totalRecords: totalCOD._count,
        averageAmount: totalCOD._count > 0 ? (totalCOD._sum.amount || 0) / totalCOD._count : 0,
        averageSettlementDays: Math.round(avgDays * 10) / 10,
      },
      statusBreakdown: codByStatus.map(item => ({
        status: item.status,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
      recentRecords: recentCODs,
    },
  });
}));

// Get shipping report
router.get('/shipping', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = { merchantId: merchant.id };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.createdAt.lte = new Date(endDate);
    }
  }

  const [
    totalShippingCost,
    courierPerformance,
    serviceUsage,
    averageWeight,
    topRoutes,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: whereClause,
      _sum: { shippingCost: true, weight: true },
      _count: true,
      _avg: { shippingCost: true },
    }),
    prisma.order.groupBy({
      by: ['courier', 'status'],
      where: whereClause,
      _count: true,
      _sum: { shippingCost: true },
    }),
    prisma.order.groupBy({
      by: ['courier', 'service'],
      where: whereClause,
      _count: true,
      _sum: { shippingCost: true },
      orderBy: { _count: { courier: 'desc' } },
    }),
    prisma.order.aggregate({
      where: whereClause,
      _avg: { weight: true },
    }),
    prisma.order.groupBy({
      by: ['recipientCity', 'recipientProvince'],
      where: whereClause,
      _count: true,
      _sum: { shippingCost: true },
      orderBy: { _count: { recipientCity: 'desc' } },
      take: 10,
    }),
  ]);

  // Process courier performance data
  const courierStats = courierPerformance.reduce((acc: any, item) => {
    if (!acc[item.courier]) {
      acc[item.courier] = {
        courier: item.courier,
        totalOrders: 0,
        totalCost: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
      };
    }
    acc[item.courier].totalOrders += item._count;
    acc[item.courier].totalCost += item._sum.shippingCost || 0;
    
    if (item.status === 'DELIVERED') {
      acc[item.courier].delivered += item._count;
    } else if (item.status === 'FAILED') {
      acc[item.courier].failed += item._count;
    } else if (['PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(item.status)) {
      acc[item.courier].pending += item._count;
    }
    
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      overview: {
        totalShippingCost: totalShippingCost._sum.shippingCost || 0,
        totalOrders: totalShippingCost._count,
        averageShippingCost: totalShippingCost._avg.shippingCost || 0,
        totalWeight: totalShippingCost._sum.weight || 0,
        averageWeight: averageWeight._avg.weight || 0,
      },
      courierPerformance: Object.values(courierStats),
      serviceUsage: serviceUsage.map(item => ({
        courier: item.courier,
        service: item.service,
        orders: item._count,
        totalCost: item._sum.shippingCost || 0,
      })),
      topRoutes: topRoutes.map(item => ({
        destination: `${item.recipientCity}, ${item.recipientProvince}`,
        orders: item._count,
        totalShippingCost: item._sum.shippingCost || 0,
      })),
    },
  });
}));

// Get returns report
router.get('/returns', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = {
    order: { merchantId: merchant.id },
  };
  
  if (startDate || endDate) {
    whereClause.requestedAt = {};
    if (startDate) {
      whereClause.requestedAt.gte = new Date(startDate);
    }
    if (endDate) {
      whereClause.requestedAt.lte = new Date(endDate);
    }
  }

  const [
    totalReturns,
    returnsByStatus,
    returnReasons,
    recentReturns,
  ] = await Promise.all([
    prisma.return.count({ where: whereClause }),
    prisma.return.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    }),
    prisma.return.findMany({
      where: whereClause,
      select: { reason: true },
    }),
    prisma.return.findMany({
      where: whereClause,
      take: 10,
      orderBy: { requestedAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            recipientName: true,
            itemName: true,
            itemValue: true,
          },
        },
      },
    }),
  ]);

  // Analyze return reasons
  const reasonCategories = returnReasons.reduce((acc: any, item) => {
    const reason = item.reason.toLowerCase();
    let category = 'Other';
    
    if (reason.includes('damaged') || reason.includes('broken')) {
      category = 'Damaged';
    } else if (reason.includes('wrong') || reason.includes('incorrect')) {
      category = 'Wrong Item';
    } else if (reason.includes('size') || reason.includes('fit')) {
      category = 'Size/Fit Issue';
    } else if (reason.includes('quality')) {
      category = 'Quality Issue';
    } else if (reason.includes('late') || reason.includes('delay')) {
      category = 'Delivery Issue';
    }
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      overview: {
        totalReturns,
        returnRate: totalReturns > 0 ? (totalReturns / (await prisma.order.count({ where: { merchantId: merchant.id } })) * 100) : 0,
      },
      statusBreakdown: returnsByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      reasonCategories: Object.entries(reasonCategories).map(([category, count]) => ({
        category,
        count,
      })),
      recentReturns,
    },
  });
}));

// Export sales report to Excel
router.get('/sales/export', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = { merchantId: merchant.id };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      orderNumber: true,
      recipientName: true,
      recipientCity: true,
      recipientProvince: true,
      courier: true,
      service: true,
      status: true,
      itemValue: true,
      shippingCost: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert to Excel format
  const excelData = orders.map(order => ({
    'Order Number': order.orderNumber,
    'Recipient Name': order.recipientName,
    'City': order.recipientCity,
    'Province': order.recipientProvince,
    'Courier': order.courier,
    'Service': order.service,
    'Status': order.status,
    'Item Value': order.itemValue,
    'Shipping Cost': order.shippingCost,
    'Created At': order.createdAt.toISOString().split('T')[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
  res.send(buffer);
}));

// Export COD report to Excel
router.get('/cod/export', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { startDate, endDate } = dateRangeSchema.parse(req.query);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = {
    order: { merchantId: merchant.id },
  };
  
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  const codRecords = await prisma.cODRecord.findMany({
    where: whereClause,
    include: {
      order: {
        select: {
          orderNumber: true,
          recipientName: true,
          recipientCity: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const excelData = codRecords.map(cod => ({
    'Order Number': cod.order.orderNumber,
    'Recipient': cod.order.recipientName,
    'City': cod.order.recipientCity,
    'Amount': cod.amount,
    'Status': cod.status,
    'Collected At': cod.collectedAt?.toISOString().split('T')[0] || '-',
    'Settled At': cod.settledAt?.toISOString().split('T')[0] || '-',
    'Created At': cod.createdAt.toISOString().split('T')[0],
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'COD Report');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="cod-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
  res.send(buffer);
}));

export default router;
