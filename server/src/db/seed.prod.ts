import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { logger } from '../shared/logger';

const SALT_ROUNDS = 10;

/**
 * Production seed - creates only one admin user
 */
export const seedProductionDatabase = async (): Promise<void> => {
    try {
        // Check if database is already populated
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            logger.info('🌱 Database already seeded (users exist). Skipping production seed.');
            return;
        }

        const defaultPassword = "12345678!";
        const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

        logger.info('🌱 Starting production database seeding...');

        // Create Admin User
        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hashedPassword,
                fullName: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
                mustChangePassword: true, // Force password change in production
            },
        });

        logger.info(`✅ Admin user created: ${admin.email}`);
        logger.info('');
        logger.info('📊 Production Seed Summary:');
        logger.info('   - Users: 1 admin');
        logger.info('');
        logger.info('✅ Production database seeded successfully!');
        logger.info('⚠️  Please change the admin password after first login!');

    } catch (error) {
        logger.error('❌ Error seeding production database:', error);
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
