import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    const adminPassword = await bcrypt.hash('Password1!', 12);
    const employeePassword = await bcrypt.hash('Test123!', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            fullName: 'Admin User',
            role: UserRole.ADMIN,
            isActive: true,
            mustChangePassword: false,
        },
    });

    const employee = await prisma.user.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: {
            email: 'test@test.com',
            password: employeePassword,
            fullName: 'משתמש בדיקה',
            role: UserRole.EMPLOYEE,
            isActive: true,
            mustChangePassword: false,
        },
    });

    console.log('✅ Users created:');
    console.log({ admin: { email: admin.email, role: admin.role } });
    console.log({ employee: { email: employee.email, role: employee.role } });
    console.log('\n📝 Login credentials:');
    console.log('Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: Password1!');
    console.log('\nEmployee (for testing):');
    console.log('  Email: test@test.com');
    console.log('  Password: Test123!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
