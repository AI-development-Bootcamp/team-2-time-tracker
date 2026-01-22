import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { logger } from '../shared/logger';


const SALT_ROUNDS = 12;

/**
 * Production seed - creates only one admin user
 * @description Minimal seed for production deployment
 */
export const seedProductionDatabase = async (): Promise<void> => {
    try {
        console.log('Running production seed script...');
        // Check if database already has users
        const userCount = await prisma.user.count();
        if (userCount > 1) {
            logger.info('Database already has users. Skipping production seed.');
            return;
        }

        const defaultPassword = "ChangeMe123!";
        const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

        logger.info('Starting production seed...');

        // Create single admin user
        const admin = await prisma.user.create({
            data: {
                email: 'admin1@example.com',
                password: hashedPassword,
                fullName: 'Admin',
                role: UserRole.ADMIN,
                isActive: true,
                mustChangePassword: true,
            },
        });

        logger.info(`Admin user created: ${admin.email}`);
        logger.info('Production seed completed successfully!');

    } catch (error) {
        logger.error('Error in production seed:', error);
        throw error;
    }
};

// Execute seed if run directly
if (require.main === module) {
    seedProductionDatabase()
        .then(async () => {
            await prisma.$disconnect();
            process.exit(0);
        })
        .catch(async (error) => {
            console.error(error);
            await prisma.$disconnect();
            process.exit(1);
        });
}
