import { describe, it, expect } from 'vitest';
import { Client } from 'pg';

describe('Database Connection', () => {
    it('should connect to the database using the provided credentials', async () => {
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
