import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { logger } from '../shared/logger';
import { env } from '../config/env';

const SALT_ROUNDS = 10;

/**
 * Initializes the database with essential data (admin user only)
 * This should be called on every startup to ensure the admin user exists
 * Does NOT seed mock data - use seedMockData() separately for that
 */
export const initializeSchema = async (): Promise<void> => {
    try {
        // Check if admin user already exists
        const adminExists = await prisma.user.findFirst({
            where: { role: UserRole.ADMIN },
        });

        if (adminExists) {
            logger.info('🔧 Schema already initialized (admin exists). Skipping.');
            return;
        }

        const defaultPassword = env.DEFAULT_SEED_PASSWORD;
        const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

        logger.info('🔧 Initializing schema with admin user...');

        // Create Admin User
        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hashedPassword,
                fullName: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
                mustChangePassword: false,
            },
        });

        logger.info(`✅ Admin user created: ${admin.email}`);
        logger.info('✅ Schema initialization completed!');
    } catch (error) {
        logger.error('❌ Error initializing schema:', error);
        throw error;
    }
};

// Execute if run directly
if (require.main === module) {
    initializeSchema()
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
