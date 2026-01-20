/// <reference types="node" />
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL;

// Fail-fast if DATABASE_URL is missing
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
