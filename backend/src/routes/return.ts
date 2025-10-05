import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const createReturnSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().min(10, 'Please provide a detailed reason'),
  notes: z.string().optional(),
});

const updateReturnSchema = z.object({
  status: z.enum(['REQUESTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED']),
  notes: z.string().optional(),
});

// Create new return request
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { orderId, reason, notes } = createReturnSchema.parse(req.body);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  // Check if order exists and belongs to merchant
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      merchantId: merchant.id,
    },
    include: {
      returnRecord: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if order is eligible for return
  if (!['DELIVERED', 'FAILED'].includes(order.status)) {
    throw new AppError('Order is not eligible for return', 400);
  }

  // Check if return already exists
  if (order.returnRecord) {
    throw new AppError('Return request already exists for this order', 409);
  }

  // Create return request
  const returnRequest = await prisma.return.create({
    data: {
      orderId,
      reason,
      notes,
      status: 'REQUESTED',
    },
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
  });

  res.status(201).json({
    success: true,
    data: returnRequest,
    message: 'Return request created successfully',
  });
}));

// Get all returns for merchant
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

  const [returns, total] = await Promise.all([
    prisma.return.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        order: {
          select: {
            orderNumber: true,
            recipientName: true,
            itemName: true,
            itemValue: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.return.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: returns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// Get single return request
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const returnRequest = await prisma.return.findFirst({
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
          codRecord: true,
        },
      },
    },
  });

  if (!returnRequest) {
    throw new AppError('Return request not found', 404);
  }

  res.json({
    success: true,
    data: returnRequest,
  });
}));

// Update return status (for demo - normally handled by admin/system)
router.patch('/:id/status', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { status, notes } = updateReturnSchema.parse(req.body);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const returnRequest = await prisma.return.findFirst({
    where: {
      id: req.params.id,
      order: { merchantId: merchant.id },
    },
  });

  if (!returnRequest) {
    throw new AppError('Return request not found', 404);
  }

  const updateData: any = { status };
  const now = new Date();

  if (notes) {
    updateData.notes = notes;
  }

  // Set timestamps based on status
  switch (status) {
    case 'APPROVED':
      updateData.approvedAt = now;
      break;
    case 'COMPLETED':
      updateData.completedAt = now;
      if (!returnRequest.approvedAt) {
        updateData.approvedAt = now;
      }
      break;
  }

  const updatedReturn = await prisma.return.update({
    where: { id: returnRequest.id },
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
    data: updatedReturn,
    message: 'Return status updated successfully',
  });
}));

// Get return statistics
router.get('/stats/summary', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const [requested, approved, rejected, inProgress, completed] = await Promise.all([
    prisma.return.count({
      where: {
        order: { merchantId: merchant.id },
        status: 'REQUESTED',
      },
    }),
    prisma.return.count({
      where: {
        order: { merchantId: merchant.id },
        status: 'APPROVED',
      },
    }),
    prisma.return.count({
      where: {
        order: { merchantId: merchant.id },
        status: 'REJECTED',
      },
    }),
    prisma.return.count({
      where: {
        order: { merchantId: merchant.id },
        status: 'IN_PROGRESS',
      },
    }),
    prisma.return.count({
      where: {
        order: { merchantId: merchant.id },
        status: 'COMPLETED',
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      requested,
      approved,
      rejected,
      inProgress,
      completed,
      total: requested + approved + rejected + inProgress + completed,
    },
  });
}));

// Cancel return request (only if status is REQUESTED)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const returnRequest = await prisma.return.findFirst({
    where: {
      id: req.params.id,
      order: { merchantId: merchant.id },
      status: 'REQUESTED', // Only allow cancellation of requested returns
    },
  });

  if (!returnRequest) {
    throw new AppError('Return request not found or cannot be cancelled', 404);
  }

  await prisma.return.delete({
    where: { id: returnRequest.id },
  });

  res.json({
    success: true,
    message: 'Return request cancelled successfully',
  });
}));

export default router;