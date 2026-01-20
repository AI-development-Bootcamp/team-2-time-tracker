/// <reference types="node" />
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL;

// Fail-fast if DATABASE_URL is missing (except in test environment)
if (!databaseUrl && process.env.NODE_ENV !== 'test') {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  datasource: {
    url: databaseUrl || 'postgresql://test:test@localhost:5432/test',
  },
});
