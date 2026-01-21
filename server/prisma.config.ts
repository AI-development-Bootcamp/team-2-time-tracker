import 'dotenv/config';
import { defineConfig } from '@prisma/config';

// Use DATABASE_URL from environment, fallback to dummy URL for prisma generate in CI
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});