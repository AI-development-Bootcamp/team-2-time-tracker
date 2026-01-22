import { prisma } from './index';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { logger } from '../shared/logger';

const SALT_ROUNDS = 10;

/**
 * Production seed - creates three admin users
 * If one fails (e.g., duplicate email), continues to the next
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

        // Define three admin users to create
        const adminUsers = [
            { email: 'admin@example.com', fullName: 'Admin User 1' },
            { email: 'admin2@example.com', fullName: 'Admin User 2' },
            { email: 'admin3@example.com', fullName: 'Admin User 3' },
        ];

        const createdUsers: string[] = [];
        const failedUsers: string[] = [];

        // Try to create each admin user, continue even if one fails
        for (const userData of adminUsers) {
            try {
                const admin = await prisma.user.create({
                    data: {
                        email: userData.email,
                        password: hashedPassword,
                        fullName: userData.fullName,
                        role: UserRole.ADMIN,
                        isActive: true,
                        mustChangePassword: true, // Force password change in production
                    },
                });
                createdUsers.push(admin.email);
                logger.info(`✅ Admin user created: ${admin.email}`);
            } catch (error: any) {
                failedUsers.push(userData.email);
                logger.warn(`⚠️  Failed to create admin user ${userData.email}: ${error.message}`);
                // Continue to next user
            }
        }

        logger.info('');
        logger.info('📊 Production Seed Summary:');
        logger.info(`   - Users created: ${createdUsers.length} admin${createdUsers.length !== 1 ? 's' : ''}`);
        if (createdUsers.length > 0) {
            createdUsers.forEach(email => logger.info(`     ✓ ${email}`));
        }
        if (failedUsers.length > 0) {
            logger.info(`   - Users failed: ${failedUsers.length}`);
            failedUsers.forEach(email => logger.info(`     ✗ ${email}`));
        }
        logger.info('');

        if (createdUsers.length > 0) {
            logger.info('✅ Production database seeded successfully!');
            logger.info('⚠️  Please change the admin passwords after first login!');
        } else {
            logger.error('❌ No admin users were created!');
        }

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
