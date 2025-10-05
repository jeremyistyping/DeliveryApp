import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const updateCODStatusSchema = z.object({
  status: z.enum(['PENDING', 'COLLECTED', 'REMITTED', 'SETTLED']),
});

// Get COD records for merchant
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const whereClause: any = {
    order: { merchantId: merchant.id },
  };

  if (status) {
    whereClause.status = status;
  }

  const [codRecords, total] = await Promise.all([
    prisma.cODRecord.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        order: {
          select: {
            orderNumber: true,
            recipientName: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cODRecord.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: codRecords,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// Get COD summary for merchant
router.get('/summary', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const [pending, collected, remitted, settled] = await Promise.all([
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
        status: 'PENDING',
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
        status: 'COLLECTED',
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
        status: 'REMITTED',
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cODRecord.aggregate({
      where: {
        order: { merchantId: merchant.id },
        status: 'SETTLED',
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      pending: {
        amount: pending._sum.amount || 0,
        count: pending._count,
      },
      collected: {
        amount: collected._sum.amount || 0,
        count: collected._count,
      },
      remitted: {
        amount: remitted._sum.amount || 0,
        count: remitted._count,
      },
      settled: {
        amount: settled._sum.amount || 0,
        count: settled._count,
      },
      total: {
        amount: (pending._sum.amount || 0) + (collected._sum.amount || 0) + (remitted._sum.amount || 0) + (settled._sum.amount || 0),
        count: pending._count + collected._count + remitted._count + settled._count,
      },
    },
  });
}));

// Get single COD record
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const codRecord = await prisma.cODRecord.findFirst({
    where: {
      id: req.params.id,
      order: { merchantId: merchant.id },
    },
    include: {
      order: {
        include: {
          merchant: {
            select: {
              businessName: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!codRecord) {
    throw new AppError('COD record not found', 404);
  }

  res.json({
    success: true,
    data: codRecord,
  });
}));

// Update COD status (for demo purposes - normally handled by courier webhook)
router.patch('/:id/status', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { status } = updateCODStatusSchema.parse(req.body);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const codRecord = await prisma.cODRecord.findFirst({
    where: {
      id: req.params.id,
      order: { merchantId: merchant.id },
    },
  });

  if (!codRecord) {
    throw new AppError('COD record not found', 404);
  }

  const updateData: any = { status };
  const now = new Date();

  // Set timestamps based on status
  switch (status) {
    case 'COLLECTED':
      updateData.collectedAt = now;
      break;
    case 'REMITTED':
      updateData.remittedAt = now;
      if (!codRecord.collectedAt) {
        updateData.collectedAt = now;
      }
      break;
    case 'SETTLED':
      updateData.settledAt = now;
      if (!codRecord.collectedAt) {
        updateData.collectedAt = now;
      }
      if (!codRecord.remittedAt) {
        updateData.remittedAt = now;
      }
      break;
  }

  const updatedCODRecord = await prisma.cODRecord.update({
    where: { id: codRecord.id },
    data: updateData,
    include: {
      order: {
        select: {
          orderNumber: true,
          recipientName: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: updatedCODRecord,
    message: 'COD status updated successfully',
  });
}));

// Bulk update COD status (for demo settlement)
router.post('/bulk-settle', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { codIds } = z.object({
    codIds: z.array(z.string()),
  }).parse(req.body);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  // Verify all COD records belong to merchant
  const codRecords = await prisma.cODRecord.findMany({
    where: {
      id: { in: codIds },
      order: { merchantId: merchant.id },
      status: { in: ['COLLECTED', 'REMITTED'] },
    },
  });

  if (codRecords.length !== codIds.length) {
    throw new AppError('Some COD records not found or invalid status', 400);
  }

  // Update all to SETTLED
  const now = new Date();
  const updatedRecords = await prisma.cODRecord.updateMany({
    where: {
      id: { in: codIds },
    },
    data: {
      status: 'SETTLED',
      settledAt: now,
    },
  });

  // Calculate total settled amount
  const totalAmount = codRecords.reduce((sum, record) => sum + record.amount, 0);

  res.json({
    success: true,
    data: {
      settledCount: updatedRecords.count,
      totalAmount,
      settledAt: now,
    },
    message: `${updatedRecords.count} COD records settled successfully`,
  });
}));

export default router;