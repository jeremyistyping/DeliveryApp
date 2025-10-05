import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const checkRatesSchema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  weight: z.number().min(0.1, 'Weight must be at least 0.1 kg'),
  courier: z.enum(['JNE', 'TIKI', 'POS', 'NINJA', 'SICEPAT', 'ANTERAJA']).optional(),
});

// Check shipping rates
router.post('/rates', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { origin, destination, weight, courier } = checkRatesSchema.parse(req.body);

  const whereClause: any = {
    origin: { contains: origin, mode: 'insensitive' },
    destination: { contains: destination, mode: 'insensitive' },
    weight: { lte: weight },
  };

  if (courier) {
    whereClause.courier = courier;
  }

  // Get shipping rates from database (in real implementation, this would call courier APIs)
  const rates = await prisma.shippingRate.findMany({
    where: whereClause,
    orderBy: [
      { courier: 'asc' },
      { cost: 'asc' },
    ],
  });

  // If no exact match, return sample rates for demo
  if (rates.length === 0) {
    const demoRates = [
      {
        id: 'demo-jne-reg',
        courier: 'JNE' as const,
        service: 'REG',
        cost: Math.floor(weight * 12000) + Math.floor(Math.random() * 5000),
        etd: '2-3 days',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'demo-jne-yes',
        courier: 'JNE' as const,
        service: 'YES',
        cost: Math.floor(weight * 18000) + Math.floor(Math.random() * 5000),
        etd: '1-2 days',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'demo-tiki-reg',
        courier: 'TIKI' as const,
        service: 'REG',
        cost: Math.floor(weight * 11000) + Math.floor(Math.random() * 5000),
        etd: '3-4 days',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'demo-sicepat-reg',
        courier: 'SICEPAT' as const,
        service: 'REG',
        cost: Math.floor(weight * 10000) + Math.floor(Math.random() * 5000),
        etd: '2-3 days',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ].filter(rate => !courier || rate.courier === courier);

    res.json({
      success: true,
      data: demoRates,
      message: 'Demo shipping rates (replace with real API integration)',
    });
    return;
  }

  res.json({
    success: true,
    data: rates,
  });
}));

// Track order by tracking number
router.get('/track/:trackingNumber', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber) {
    throw new AppError('Tracking number is required', 400);
  }

  // Find order by tracking number
  const order = await prisma.order.findFirst({
    where: { trackingNumber },
    include: {
      merchant: {
        where: { userId: req.user!.id },
      },
      trackingHistory: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!order || !order.merchant) {
    throw new AppError('Order not found or access denied', 404);
  }

  // In real implementation, this would call courier tracking API
  // For demo, return tracking history from database
  const trackingInfo = order.trackingHistory.map(history => ({
    status: history.status,
    description: history.description,
    date: history.date,
    city: history.city,
  }));

  res.json({
    success: true,
    data: {
      trackingNumber: order.trackingNumber,
      status: order.status,
      courier: order.courier,
      service: order.service,
      history: trackingInfo,
      order: {
        orderNumber: order.orderNumber,
        recipientName: order.recipientName,
        recipientCity: order.recipientCity,
      },
    },
  });
}));

// Get order tracking by order ID
router.get('/track/order/:orderId', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { orderId } = req.params;

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      merchantId: merchant.id,
    },
    include: {
      trackingHistory: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // If no tracking number, return basic status
  if (!order.trackingNumber) {
    res.json({
      success: true,
      data: {
        status: order.status,
        history: order.trackingHistory.map(history => ({
          status: history.status,
          description: history.description,
          date: history.date,
          city: history.city,
        })),
        message: 'Tracking number not assigned yet',
      },
    });
    return;
  }

  // Add some demo tracking events if none exist
  if (order.trackingHistory.length === 0) {
    const demoHistory = [];
    
    if (order.status !== 'PENDING') {
      demoHistory.push({
        status: 'CONFIRMED',
        description: 'Order confirmed and ready for pickup',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        city: order.merchant?.city,
      });
    }
    
    if (['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      demoHistory.push({
        status: 'PICKED_UP',
        description: 'Package picked up by courier',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        city: order.merchant?.city,
      });
    }
    
    if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      demoHistory.push({
        status: 'IN_TRANSIT',
        description: 'Package in transit to destination',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        city: 'Sorting Center',
      });
    }
    
    if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      demoHistory.push({
        status: 'OUT_FOR_DELIVERY',
        description: 'Package out for delivery',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        city: order.recipientCity,
      });
    }
    
    if (order.status === 'DELIVERED') {
      demoHistory.push({
        status: 'DELIVERED',
        description: 'Package delivered successfully',
        date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        city: order.recipientCity,
      });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: order.trackingNumber,
        status: order.status,
        courier: order.courier,
        service: order.service,
        history: demoHistory,
        message: 'Demo tracking data (replace with real courier API)',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      trackingNumber: order.trackingNumber,
      status: order.status,
      courier: order.courier,
      service: order.service,
      history: order.trackingHistory.map(history => ({
        status: history.status,
        description: history.description,
        date: history.date,
        city: history.city,
      })),
    },
  });
}));

// Public tracking endpoint (no auth required) - untuk customer tracking
router.get('/public/track/:trackingNumber', asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber) {
    throw new AppError('Tracking number is required', 400);
  }

  // Find order by tracking number
  const order = await prisma.order.findFirst({
    where: { trackingNumber },
    include: {
      trackingHistory: {
        orderBy: { date: 'desc' },
      },
      merchant: {
        select: {
          businessName: true,
          city: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Tracking number not found', 404);
  }

  res.json({
    success: true,
    data: {
      trackingNumber: order.trackingNumber,
      orderNumber: order.orderNumber,
      status: order.status,
      courier: order.courier,
      service: order.service,
      recipientName: order.recipientName,
      recipientCity: order.recipientCity,
      createdAt: order.createdAt,
      history: order.trackingHistory.map(history => ({
        status: history.status,
        description: history.description,
        date: history.date,
        city: history.city,
      })),
    },
  });
}));

// Simulate courier webhook for status update (for testing/demo)
router.post('/webhook/update-status', asyncHandler(async (req, res) => {
  const { trackingNumber, status, description, city } = req.body;

  if (!trackingNumber || !status) {
    throw new AppError('Tracking number and status are required', 400);
  }

  const order = await prisma.order.findFirst({
    where: { trackingNumber },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: { status },
  });

  // Add tracking history
  await prisma.trackingHistory.create({
    data: {
      orderId: order.id,
      status,
      description: description || `Status updated to ${status}`,
      city: city || null,
      date: new Date(),
    },
  });

  // If delivered and has COD, update COD status to collected
  if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
    await prisma.cODRecord.updateMany({
      where: { orderId: order.id },
      data: {
        status: 'COLLECTED',
        collectedAt: new Date(),
      },
    });
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: {
      trackingNumber,
      status,
    },
  });
}));

export default router;
