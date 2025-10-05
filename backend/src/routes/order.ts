import { Router } from 'express';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateOrderNumber } from '../lib/utils';
import { generateShippingLabel } from '../lib/pdf';
import { uploadExcel } from '../middleware/upload';

const router = Router();

const createOrderSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientPhone: z.string().min(10, 'Valid phone number is required'),
  recipientAddress: z.string().min(10, 'Complete address is required'),
  recipientCity: z.string().min(2, 'City is required'),
  recipientProvince: z.string().min(2, 'Province is required'),
  recipientPostalCode: z.string().min(5, 'Postal code is required'),
  courier: z.enum(['JNE', 'TIKI', 'POS', 'NINJA', 'SICEPAT', 'ANTERAJA']),
  service: z.string().min(2, 'Service type is required'),
  weight: z.number().min(0.1, 'Weight must be at least 0.1 kg'),
  length: z.number().min(1, 'Length is required'),
  width: z.number().min(1, 'Width is required'),
  height: z.number().min(1, 'Height is required'),
  itemName: z.string().min(2, 'Item name is required'),
  itemValue: z.number().min(1000, 'Item value must be at least Rp 1,000'),
  paymentMethod: z.enum(['COD', 'PREPAID']),
  codAmount: z.number().optional(),
  shippingCost: z.number().min(1000, 'Shipping cost is required'),
  notes: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED', 
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED',
    'RETURNED',
    'CANCELLED',
  ]),
  trackingNumber: z.string().optional(),
});

// Create new order
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const orderData = createOrderSchema.parse(req.body);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found. Please complete your profile first.', 404);
  }

  // Validate COD amount
  if (orderData.paymentMethod === 'COD' && !orderData.codAmount) {
    throw new AppError('COD amount is required for COD orders', 400);
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        ...orderData,
        merchantId: merchant.id,
        orderNumber,
        status: 'PENDING',
      },
      include: {
        merchant: {
          select: {
            businessName: true,
            address: true,
            city: true,
            province: true,
            phone: true,
          },
        },
      },
    });

    // Create COD record if COD payment
    if (orderData.paymentMethod === 'COD' && orderData.codAmount) {
      await tx.codRecord.create({
        data: {
          orderId: newOrder.id,
          amount: orderData.codAmount,
          status: 'PENDING',
        },
      });
    }

    return newOrder;
  });

  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully',
  });
}));

// Get all orders for merchant
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

  const whereClause: any = { merchantId: merchant.id };
  if (status) {
    whereClause.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        codRecord: true,
        trackingHistory: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// Get single order
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      merchantId: merchant.id,
    },
    include: {
      merchant: true,
      codRecord: true,
      trackingHistory: {
        orderBy: { date: 'desc' },
      },
      returnRecord: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.json({
    success: true,
    data: order,
  });
}));

// Update order status
router.patch('/:id/status', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { status, trackingNumber } = updateOrderStatusSchema.parse(req.body);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      merchantId: merchant.id,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      ...(trackingNumber && { trackingNumber }),
    },
    include: {
      codRecord: true,
    },
  });

  // Add tracking history
  await prisma.trackingHistory.create({
    data: {
      orderId: order.id,
      status,
      description: `Order status updated to ${status}`,
      date: new Date(),
    },
  });

  res.json({
    success: true,
    data: updatedOrder,
    message: 'Order status updated successfully',
  });
}));

// Generate shipping label PDF with print tracking
router.get('/:id/label', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      merchantId: merchant.id,
    },
    include: {
      merchant: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Update print count
  await prisma.order.update({
    where: { id: order.id },
    data: {
      printCount: order.printCount + 1,
      lastPrintedAt: new Date(),
    },
  });

  const pdfBuffer = await generateShippingLabel(order);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="label-${order.orderNumber}.pdf"`);
  res.send(pdfBuffer);
}));

// Delete order (only if pending)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      merchantId: merchant.id,
      status: 'PENDING', // Only allow deletion of pending orders
    },
  });

  if (!order) {
    throw new AppError('Order not found or cannot be deleted', 404);
  }

  await prisma.order.delete({
    where: { id: order.id },
  });

  res.json({
    success: true,
    message: 'Order deleted successfully',
  });
}));

// Bulk import orders from Excel
router.post('/bulk-import', authenticate, uploadExcel.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user!.id },
  });

  if (!merchant) {
    throw new AppError('Merchant profile not found', 404);
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (data.length === 0) {
      throw new AppError('Excel file is empty', 400);
    }

    const errors: any[] = [];
    const successOrders: any[] = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate and transform data
        const orderData = {
          recipientName: String(row.recipientName || row['Recipient Name'] || '').trim(),
          recipientPhone: String(row.recipientPhone || row['Recipient Phone'] || '').trim(),
          recipientAddress: String(row.recipientAddress || row['Recipient Address'] || '').trim(),
          recipientCity: String(row.recipientCity || row['Recipient City'] || '').trim(),
          recipientProvince: String(row.recipientProvince || row['Recipient Province'] || '').trim(),
          recipientPostalCode: String(row.recipientPostalCode || row['Recipient Postal Code'] || '').trim(),
          courier: String(row.courier || row['Courier'] || 'JNE').toUpperCase(),
          service: String(row.service || row['Service'] || 'REG').trim(),
          weight: Number(row.weight || row['Weight'] || 1),
          length: Number(row.length || row['Length'] || 10),
          width: Number(row.width || row['Width'] || 10),
          height: Number(row.height || row['Height'] || 10),
          itemName: String(row.itemName || row['Item Name'] || '').trim(),
          itemValue: Number(row.itemValue || row['Item Value'] || 0),
          paymentMethod: String(row.paymentMethod || row['Payment Method'] || 'COD').toUpperCase(),
          codAmount: Number(row.codAmount || row['COD Amount'] || 0),
          shippingCost: Number(row.shippingCost || row['Shipping Cost'] || 0),
          notes: String(row.notes || row['Notes'] || '').trim(),
        };

        // Validate required fields
        if (!orderData.recipientName || orderData.recipientName.length < 2) {
          throw new Error('Recipient name is required');
        }
        if (!orderData.recipientPhone || orderData.recipientPhone.length < 10) {
          throw new Error('Valid phone number is required');
        }
        if (!orderData.recipientAddress || orderData.recipientAddress.length < 10) {
          throw new Error('Complete address is required');
        }
        if (!orderData.itemName || orderData.itemName.length < 2) {
          throw new Error('Item name is required');
        }
        if (orderData.itemValue < 1000) {
          throw new Error('Item value must be at least Rp 1,000');
        }

        const orderNumber = generateOrderNumber();

        // Create order in transaction
        const order = await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              ...orderData,
              merchantId: merchant.id,
              orderNumber,
              status: 'PENDING',
            },
          });

          // Create COD record if COD payment
          if (orderData.paymentMethod === 'COD' && orderData.codAmount > 0) {
            await tx.cODRecord.create({
              data: {
                orderId: newOrder.id,
                amount: orderData.codAmount,
                status: 'PENDING',
              },
            });
          }

          return newOrder;
        });

        successOrders.push({
          row: i + 2, // Excel row number (1-indexed + header)
          orderNumber: order.orderNumber,
          recipientName: order.recipientName,
        });
      } catch (error: any) {
        errors.push({
          row: i + 2,
          error: error.message,
          data: row,
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalRows: data.length,
        successCount: successOrders.length,
        errorCount: errors.length,
        successOrders,
        errors: errors.slice(0, 10), // Limit errors to first 10
      },
      message: `Successfully imported ${successOrders.length} out of ${data.length} orders`,
    });
  } catch (error: any) {
    throw new AppError(`Failed to parse Excel file: ${error.message}`, 400);
  }
}));

// Download Excel template for bulk import
router.get('/bulk-import/template', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  // Create a sample template
  const template = [
    {
      'Recipient Name': 'John Doe',
      'Recipient Phone': '08123456789',
      'Recipient Address': 'Jl. Sudirman No. 123',
      'Recipient City': 'Jakarta',
      'Recipient Province': 'DKI Jakarta',
      'Recipient Postal Code': '10220',
      'Courier': 'JNE',
      'Service': 'REG',
      'Weight': 1.0,
      'Length': 20,
      'Width': 15,
      'Height': 10,
      'Item Name': 'Paket Barang',
      'Item Value': 150000,
      'Payment Method': 'COD',
      'COD Amount': 150000,
      'Shipping Cost': 15000,
      'Notes': 'Handle with care',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="order-import-template.xlsx"');
  res.send(buffer);
}));

export default router;
