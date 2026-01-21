#!/usr/bin/env node
/**
 * @fileoverview Database initialization script
 * @description Standalone script to initialize database schema and seed data
 * 
 * Usage:
 *   npm run db:init              # Run migrations and seed
 *   npm run db:init --no-migrate # Skip migrations, only seed
 *   npm run db:init --no-seed    # Only run migrations
 */

import 'dotenv/config';
import { initializeDatabase } from './index';
import { logger } from '../shared/logger';

async function main() {
    const args = process.argv.slice(2);

    const options = {
        runMigrations: !args.includes('--no-migrate'),
        runSeed: !args.includes('--no-seed'),
    };

    logger.info('Starting database initialization script...');
    logger.info(`Options: ${JSON.stringify(options, null, 2)}`);

    try {
        await initializeDatabase(options);
        logger.info('✅ Database initialization script completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Database initialization script failed:', error);
        process.exit(1);
    }
}

main();
