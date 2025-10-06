import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all users (Main Admin & General Admin)
router.get('/', authenticate, authorize(['MAIN_ADMIN', 'GENERAL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    throw new AppError('Failed to fetch users', 500);
  }
});

// Get single user (Main Admin & General Admin)
router.get('/:id', authenticate, authorize(['MAIN_ADMIN', 'GENERAL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            phone: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

// Update user role (Main Admin only)
router.patch('/:id/role', authenticate, authorize(['MAIN_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['MAIN_ADMIN', 'GENERAL_ADMIN', 'USER', 'MERCHANT', 'ADMIN', 'OWNER'];
    if (!validRoles.includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    // Prevent changing own role
    if (id === req.user?.id) {
      throw new AppError('Cannot change your own role', 403);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    throw error;
  }
});

// Deactivate/Activate user (Main Admin only)
router.patch('/:id/status', authenticate, authorize(['MAIN_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent deactivating own account
    if (id === req.user?.id) {
      throw new AppError('Cannot change your own status', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update merchant status if user is a merchant
    if (user.merchant) {
      await prisma.merchant.update({
        where: { id: user.merchant.id },
        data: { isActive },
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id, isActive },
    });
  } catch (error) {
    throw error;
  }
});

// Delete user (Main Admin only)
router.delete('/:id', authenticate, authorize(['MAIN_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user?.id) {
      throw new AppError('Cannot delete your own account', 403);
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    throw error;
  }
});

// Get user statistics (Main Admin & General Admin)
router.get('/stats/summary', authenticate, authorize(['MAIN_ADMIN', 'GENERAL_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const [totalUsers, totalMerchants, totalAdmins, totalRegularUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MERCHANT' } }),
      prisma.user.count({
        where: {
          role: {
            in: ['MAIN_ADMIN', 'GENERAL_ADMIN', 'ADMIN'],
          },
        },
      }),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMerchants,
        totalAdmins,
        totalRegularUsers,
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch user statistics', 500);
  }
});

export default router;
