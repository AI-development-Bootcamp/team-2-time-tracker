/// <reference types="node" />
import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Load .env file (override existing env vars)
config({ override: true });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
