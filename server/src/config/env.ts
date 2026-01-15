// Load environment variables from .env file into process.env
import 'dotenv/config';
import { z } from 'zod';

// Define the schema for required environment variables with validation
const envSchema = z.object({
  // Server port - defaults to 3000 if not specified
  PORT: z.coerce.number().default(3000),
  // Runtime environment - affects logging and error handling
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Frontend URL for CORS - defaults to Vite dev server
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

// Validate environment variables against the schema
const parsed = envSchema.safeParse(process.env);

// Exit early if required variables are missing or invalid
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

// Export validated and typed config object
export const config = parsed.data;
