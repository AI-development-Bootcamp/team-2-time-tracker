import 'dotenv/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from './index';

const DEV_PASSWORD = 'Password1!';

async function main() {
    // Only seed in development environment
    const nodeEnv = process.env.NODE_ENV?.trim();
    if (nodeEnv !== 'development') {
        console.log(`Skipping seed: NODE_ENV is "${nodeEnv}", not "development"`);
        return;
    }

    console.log('Seeding development users...');

    const hashedPassword = await bcrypt.hash(DEV_PASSWORD, 12);

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            email: 'admin@company.com',
            password: hashedPassword,
            fullName: 'מנהל מערכת',
            role: UserRole.ADMIN,
            isActive: true,
            mustChangePassword: false,
        },
    });

    // Create regular employee user
    const employee = await prisma.user.upsert({
        where: { email: 'employee@company.com' },
        update: {},
        create: {
            email: 'employee@company.com',
            password: hashedPassword,
            fullName: 'עובד לדוגמה',
            role: UserRole.EMPLOYEE,
            isActive: true,
            mustChangePassword: false,
        },
    });

    console.log('Development users created:');
    console.log('  Admin:', admin.email, '| Password:', DEV_PASSWORD);
    console.log('  Employee:', employee.email, '| Password:', DEV_PASSWORD);
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
