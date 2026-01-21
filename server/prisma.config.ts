/// <reference types="node" />
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
