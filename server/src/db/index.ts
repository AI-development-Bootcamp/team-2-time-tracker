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
 * @description Initialize the database by running migrations and setting up initial data
 * This function should be called on application startup to ensure:
 * 1. Database schema is up-to-date (via Prisma migrations)
 * 2. Admin user exists (schema initialization)
 * 3. (Optional) Mock data for development
 *
 * @param {boolean} runMigrations - Whether to run Prisma migrations (default: true)
 * @param {boolean} runSeed - Whether to initialize schema/admin user (default: true)
 * @param {boolean} seedMockData - Whether to seed mock data for development (default: false)
 * @returns {Promise<void>}
 *
 * @example
 * // In app.ts startup (production) - only creates admin user
 * await initializeDatabase();
 *
 * @example
 * // Development with mock data
 * await initializeDatabase({ seedMockData: true });
 *
 * @example
 * // Skip migrations in production (use manual migrations)
 * await initializeDatabase({ runMigrations: false });
 */
export async function initializeDatabase(options?: {
    runMigrations?: boolean;
    runSeed?: boolean;
    seedMockData?: boolean;
}): Promise<void> {
    const {
        runMigrations = true, // Run migrations in all environments by default
        runSeed = true,
        seedMockData: shouldSeedMockData = false, // Mock data seeding is OFF by default
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

        // Step 3: Initialize schema (admin user) - always runs if enabled
        if (runSeed) {
            logger.info('🔧 Initializing schema (admin user)...');

            // Dynamically import to avoid circular dependencies
            const { initializeSchema } = await import('./schema-init');
            await initializeSchema();

            logger.info('✅ Schema initialization completed');
        } else {
            logger.info('⏭️  Skipping schema initialization (runSeed=false)');
        }

        // Step 4: Seed mock data (only if explicitly enabled - for development)
        if (shouldSeedMockData) {
            logger.info('🌱 Seeding mock data...');

            const { seedMockData } = await import('./seed-mock-data');
            await seedMockData();

            logger.info('✅ Mock data seeding completed');
        } else {
            logger.info('⏭️  Skipping mock data seeding (seedMockData=false)');
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
