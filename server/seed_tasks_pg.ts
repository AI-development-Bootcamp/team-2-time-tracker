
import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

async function seedDirect() {
    console.log('Seeding Tasks via direct PG...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const client = await pool.connect();

        // Upsert Client
        await client.query(`
            INSERT INTO clients (id, name, status, created_at, updated_at)
            VALUES ($1, $2, 'ACTIVE', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        `, ['550e8400-e29b-41d4-a716-446655440001', 'לקוח א']);
        console.log('✓ Client upserted');

        // Upsert Project
        await client.query(`
            INSERT INTO projects (id, client_id, name, status, report_type, created_at, updated_at)
            VALUES ($1, $2, $3, 'ACTIVE', 'TOTAL_HOURS', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        `, ['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'פרויקט 1']);
        console.log('✓ Project upserted');

        // Upsert Task
        await client.query(`
            INSERT INTO tasks (id, project_id, name, status, created_at)
            VALUES ($1, $2, $3, 'OPEN', NOW())
            ON CONFLICT (id) DO NOTHING
        `, ['550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440011', 'משימה 1']);
        console.log('✓ Task upserted');

        client.release();
        console.log('✅ Seeding completed via PG driver!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await pool.end();
    }
}

seedDirect();
