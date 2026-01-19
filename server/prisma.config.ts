/// <reference types="node" />
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://maiilany@localhost:5432/timetracker',
  },
});
