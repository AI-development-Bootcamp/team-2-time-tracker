import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().optional().refine(
    (val) => {
      // DATABASE_URL is required unless NODE_ENV is 'test'
      if (process.env.NODE_ENV === 'test') {
        return true; // Optional in test environment
      }
      return val !== undefined && val.length > 0;
    },
    {
      message: 'DATABASE_URL is required when NODE_ENV is not "test"',
    }
  ),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  CORS_ORIGIN: z.string().default('*'),
  DEFAULT_SEED_PASSWORD: z.string().default('password123'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
