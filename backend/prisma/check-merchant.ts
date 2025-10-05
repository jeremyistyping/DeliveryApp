import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMerchant() {
  const user = await prisma.user.findUnique({
    where: { email: 'merchant1@example.com' },
    include: { merchant: true },
  });

  console.log('User found:', JSON.stringify(user, null, 2));

  const allMerchants = await prisma.merchant.findMany();
  console.log('\nAll merchants:', JSON.stringify(allMerchants, null, 2));
}

checkMerchant()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
