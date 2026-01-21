
import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

async function listTables() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in DB:', res.rows.map(r => r.table_name));
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listTables();
