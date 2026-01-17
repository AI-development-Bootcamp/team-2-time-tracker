import { describe, it, expect } from 'vitest';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

describe('Database Connection', () => {
    it('should connect to the database using the provided credentials', async () => {
        // Attempt to load from server/env if not in process.env (specifically for this investigation)
        if (!process.env.DATABASE_URL) {
            const possibleEnvPath = path.resolve(__dirname, '../../env'); // Relates to server/tests/integration/../../env -> server/env
            if (fs.existsSync(possibleEnvPath)) {
                console.log(`Loading environment from ${possibleEnvPath}`);
                const envConfig = dotenv.parse(fs.readFileSync(possibleEnvPath));
                if (envConfig.DATABASE_URL) {
                    process.env.DATABASE_URL = envConfig.DATABASE_URL;
                }
            }
        }

        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            console.warn('Skipping database connection test: DATABASE_URL not defined');
            return;
        }

        const client = new Client({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            },
            connectionTimeoutMillis: 10000 
        });

        try {
            await client.connect();
            const res = await client.query('SELECT NOW() as now');
            expect(res.rows[0]).toHaveProperty('now');
            await client.end();
        } catch (err) {
            console.error('Database connection failed:', err);
            throw err;
        }
    });
});
