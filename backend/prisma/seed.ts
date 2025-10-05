import { PrismaClient, CourierType, OrderStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin users with different passwords
  const mainAdminPassword = await bcrypt.hash('main123', 10);
  const generalAdminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const merchantPassword = await bcrypt.hash('password123', 10);

  // Main Admin - Full access
  const mainAdmin = await prisma.user.create({
    data: {
      email: 'mainadmin@delivery.com',
      password: mainAdminPassword,
      name: 'Main Administrator',
      role: 'MAIN_ADMIN',
    },
  });

  // General Admin - Operational access
  const generalAdmin = await prisma.user.create({
    data: {
      email: 'admin1@delivery.com',
      password: generalAdminPassword,
      name: 'General Administrator',
      role: 'GENERAL_ADMIN',
    },
  });

  // Regular User - View only access
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@delivery.com',
      password: userPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });

  // Demo merchant users
  const user1 = await prisma.user.create({
    data: {
      email: 'merchant1@example.com',
      password: merchantPassword,
      name: 'Demo Merchant 1',
      role: 'MERCHANT',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'merchant2@example.com',
      password: merchantPassword,
      name: 'Demo Merchant 2',
      role: 'MERCHANT',
    },
  });

  // Create merchants
  const merchant1 = await prisma.merchant.create({
    data: {
      userId: user1.id,
      businessName: 'Toko Demo 1',
      businessType: 'Fashion',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '10220',
      phone: '08123456789',
      email: 'merchant1@example.com',
    },
  });

  const merchant2 = await prisma.merchant.create({
    data: {
      userId: user2.id,
      businessName: 'Toko Demo 2',
      businessType: 'Electronics',
      address: 'Jl. Thamrin No. 456',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '10230',
      phone: '08123456790',
      email: 'merchant2@example.com',
    },
  });

  // Create sample orders
  await prisma.order.createMany({
    data: [
      {
        merchantId: merchant1.id,
        orderNumber: 'ORD-001-2024',
        recipientName: 'John Doe',
        recipientPhone: '08198765432',
        recipientAddress: 'Jl. Gatot Subroto No. 789',
        recipientCity: 'Bandung',
        recipientProvince: 'Jawa Barat',
        recipientPostalCode: '40123',
        courier: CourierType.JNE,
        service: 'REG',
        weight: 1.5,
        length: 20,
        width: 15,
        height: 10,
        itemName: 'Kemeja Pria',
        itemValue: 150000,
        paymentMethod: PaymentMethod.COD,
        codAmount: 150000,
        shippingCost: 15000,
        status: OrderStatus.PENDING,
      },
      {
        merchantId: merchant1.id,
        orderNumber: 'ORD-002-2024',
        recipientName: 'Jane Smith',
        recipientPhone: '08187654321',
        recipientAddress: 'Jl. Asia Afrika No. 101',
        recipientCity: 'Surabaya',
        recipientProvince: 'Jawa Timur',
        recipientPostalCode: '60123',
        courier: CourierType.TIKI,
        service: 'REG',
        weight: 0.8,
        length: 15,
        width: 10,
        height: 5,
        itemName: 'Dress Wanita',
        itemValue: 200000,
        paymentMethod: PaymentMethod.PREPAID,
        shippingCost: 12000,
        status: OrderStatus.CONFIRMED,
        trackingNumber: 'TK123456789',
      },
      {
        merchantId: merchant2.id,
        orderNumber: 'ORD-003-2024',
        recipientName: 'Bob Wilson',
        recipientPhone: '08176543210',
        recipientAddress: 'Jl. Malioboro No. 202',
        recipientCity: 'Yogyakarta',
        recipientProvince: 'DI Yogyakarta',
        recipientPostalCode: '55123',
        courier: CourierType.JNE,
        service: 'YES',
        weight: 2.0,
        length: 25,
        width: 20,
        height: 15,
        itemName: 'Smartphone',
        itemValue: 3000000,
        paymentMethod: PaymentMethod.COD,
        codAmount: 3000000,
        shippingCost: 25000,
        status: OrderStatus.DELIVERED,
        trackingNumber: 'JNE987654321',
      },
    ],
  });

  // Create sample shipping rates
  await prisma.shippingRate.createMany({
    data: [
      {
        courier: CourierType.JNE,
        service: 'REG',
        origin: 'Jakarta',
        destination: 'Bandung',
        weight: 1.0,
        cost: 15000,
        etd: '2-3 days',
      },
      {
        courier: CourierType.JNE,
        service: 'YES',
        origin: 'Jakarta',
        destination: 'Bandung',
        weight: 1.0,
        cost: 25000,
        etd: '1-2 days',
      },
      {
        courier: CourierType.TIKI,
        service: 'REG',
        origin: 'Jakarta',
        destination: 'Surabaya',
        weight: 1.0,
        cost: 18000,
        etd: '3-4 days',
      },
      {
        courier: CourierType.SICEPAT,
        service: 'REG',
        origin: 'Jakarta',
        destination: 'Yogyakarta',
        weight: 1.0,
        cost: 16000,
        etd: '2-3 days',
      },
    ],
  });

  console.log('Seed data created successfully!');
  console.log('\n=== User Accounts Created ===');
  console.log('Main Admin:');
  console.log('  Email: mainadmin@delivery.com');
  console.log('  Password: main123');
  console.log('\nGeneral Admin:');
  console.log('  Email: admin1@delivery.com');
  console.log('  Password: admin123');
  console.log('\nRegular User:');
  console.log('  Email: user@delivery.com');
  console.log('  Password: user123');
  console.log('\nMerchant Accounts:');
  console.log('  Email: merchant1@example.com');
  console.log('  Password: password123');
  console.log('=============================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });