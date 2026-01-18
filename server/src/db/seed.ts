import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole } from '@shared/types';
import { logger } from '../shared/logger';
import { env } from '../config/env';

export const seedDatabase = async () => {
    try {
        const saltRounds = 10;
        const defaultPassword = env.DEFAULT_SEED_PASSWORD;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        // Ensure Admin User exists
        const admin = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: {},
            create: {
                email: 'admin@example.com',
                password: hashedPassword,
                fullName: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
                mustChangePassword: false,
            },
        });

        // Ensure Employee User exists
        const employee = await prisma.user.upsert({
            where: { email: 'employee@example.com' },
            update: {},
            create: {
                email: 'employee@example.com',
                password: hashedPassword,
                fullName: 'Employee User',
                role: UserRole.EMPLOYEE,
                isActive: true,
                mustChangePassword: false,
            },
        });

        logger.info('Database seeding check completed.');
        logger.debug(`Users verified: ${admin.email}, ${employee.email}`);
    } catch (error) {
        logger.error('Failed to seed database:', error);
    }
};
