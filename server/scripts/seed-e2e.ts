import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting E2E database seeding...');

  // Clean existing data
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned existing data');

  // Create test users
  const password = await bcrypt.hash('Test123!', 10);

  const testEmployee = await prisma.user.create({
    data: {
      email: 'test.employee@example.com',
      password,
      fullName: 'Test Employee',
      role: UserRole.EMPLOYEE,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const testAdmin = await prisma.user.create({
    data: {
      email: 'test.admin@example.com',
      password,
      fullName: 'Test Admin',
      role: UserRole.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const newEmployee = await prisma.user.create({
    data: {
      email: 'new.employee@example.com',
      password,
      fullName: 'New Employee',
      role: UserRole.EMPLOYEE,
      isActive: true,
      mustChangePassword: true,
    },
  });

  console.log('Created test users:');
  console.log(`- Employee: ${testEmployee.email} (${testEmployee.role})`);
  console.log(`- Admin: ${testAdmin.email} (${testAdmin.role})`);
  console.log(`- New Employee: ${newEmployee.email} (${newEmployee.role}, mustChangePassword: ${newEmployee.mustChangePassword})`);

  console.log('E2E database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
