import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_URL: z.string().trim().default('http://localhost:3000'),
  CORS_ORIGIN: z.string().trim().default('http://localhost:3000'),
  DATABASE_URL: z.string().trim().optional().default(''),
  DIRECT_DATABASE_URL: z.string().trim().optional().default(''),
  GEMINI_API_KEY: z.string().trim().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().trim().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().trim().optional().default(''),
  ERAKTKOSH_API_BASE_URL: z.string().trim().optional().default(''),
  ERAKTKOSH_API_KEY: z.string().trim().optional().default(''),
  HOSPITAL_SYSTEM_API_BASE_URL: z.string().trim().optional().default(''),
  HOSPITAL_SYSTEM_API_KEY: z.string().trim().optional().default(''),
  BLOOD_BANK_SYSTEM_API_BASE_URL: z.string().trim().optional().default(''),
  BLOOD_BANK_SYSTEM_API_KEY: z.string().trim().optional().default(''),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3600000).optional(),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().min(1).max(1000).optional(),
  RATE_LIMIT_PUBLIC_MAX: z.coerce.number().int().min(1).max(10000).optional(),
  RATE_LIMIT_AUTHENTICATED_MAX: z.coerce.number().int().min(1).max(10000).optional(),
  RATE_LIMIT_ADMIN_MAX: z.coerce.number().int().min(1).max(10000).optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid server environment configuration detected.');
  throw new Error('Server environment configuration validation failed.');
}

export const env = parsed.data;
