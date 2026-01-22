import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../shared/logger';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * @description Initialize the database by running migrations and seeding initial data
 * This function should be called on application startup to ensure:
 * 1. Database schema is up-to-date (via Prisma migrations)
 * 2. Initial seed data exists (admin/employee users)
 * 
 * @param {boolean} runMigrations - Whether to run Prisma migrations (default: true in development)
 * @param {boolean} runSeed - Whether to run database seeding (default: true)
 * @returns {Promise<void>}
 * 
 * @example
 * // In app.ts startup
 * await initializeDatabase();
 * 
 * @example
 * // Skip migrations in production (use manual migrations)
 * await initializeDatabase({ runMigrations: false });
 */
export async function initializeDatabase(options?: {
    runMigrations?: boolean;
    runSeed?: boolean;
}): Promise<void> {
    const {
        runMigrations = true, // Run migrations in all environments by default
        runSeed = true,
    } = options ?? {};

    try {
        logger.info('🔧 Initializing database...');

        // Step 1: Test database connection
        await prisma.$connect();
        logger.info('✅ Database connection established');

        // Step 2: Run migrations (if enabled)
        if (runMigrations) {
            logger.info('🔄 Running Prisma migrations...');

            // Import exec from child_process to run Prisma CLI commands
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            try {
                // Run Prisma migrate deploy (safe for all environments)
                const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
                    cwd: process.cwd(),
                    env: process.env,
                });

                if (stdout) logger.debug(stdout);
                if (stderr && !stderr.includes('already applied')) {
                    logger.warn('Migration warnings:', stderr);
                }

                logger.info('✅ Migrations completed successfully');
            } catch (migrationError: any) {
                // If migrations fail, log but don't crash (tables might already exist)
                logger.warn('⚠️  Migration warning:', migrationError.message);
                logger.info('Continuing with existing schema...');
            }
        } else {
            logger.info('⏭️  Skipping migrations (runMigrations=false)');
        }

        // Step 3: Run database seeding (if enabled)
        if (runSeed) {
            logger.info('🌱 Seeding database...');

            // Choose the appropriate seed based on NODE_ENV
            if (process.env.NODE_ENV === 'production') {
                const { seedProductionDatabase } = await import('./seed.prod');
                await seedProductionDatabase();
            } else {
                const { seedDatabase } = await import('./seed');
                await seedDatabase();
            }

            logger.info('✅ Database seeding completed');
        } else {
            logger.info('⏭️  Skipping seeding (runSeed=false)');
        }

        logger.info('🎉 Database initialization completed successfully!');
    } catch (error) {
        logger.error('❌ Database initialization failed:', error);
        throw error;
    }
}

/**
 * @description Gracefully disconnect from the database
 * Should be called on application shutdown
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // In app shutdown handler
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase();
 *   process.exit(0);
 * });
 */
export async function disconnectDatabase(): Promise<void> {
    try {
        await prisma.$disconnect();
        await pool.end();
        logger.info('👋 Database disconnected successfully');
    } catch (error) {
        logger.error('Error disconnecting from database:', error);
        throw error;
    }
}
