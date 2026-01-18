/**
 * @fileoverview Integration tests setup with real database
 */

import { prisma } from '../../src/db';
import { execSync } from 'child_process';

export { prisma };

/**
 * Setup database before all integration tests
 */
export async function setupDatabase() {
    try {
        // Run migrations
        execSync('pnpm prisma migrate deploy', {
            env: { ...process.env },
            stdio: 'inherit',
        });

        console.log('✓ Database migrations completed');
    } catch (error) {
        console.error('Failed to run migrations:', error);
        throw error;
    }
}

/**
 * Clean up database after tests
 */
export async function cleanupDatabase() {
    try {
        // Clean up test data in reverse order of dependencies
        await prisma.refreshToken.deleteMany();
        await prisma.user.deleteMany();

        console.log('✓ Database cleaned up');
    } catch (error) {
        console.error('Failed to clean database:', error);
    }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase() {
    await prisma.$disconnect();
}
