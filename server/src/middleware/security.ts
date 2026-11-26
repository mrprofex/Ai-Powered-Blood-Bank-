import cors from 'cors';
import helmet from 'helmet';
import type { RequestHandler } from 'express';
import { env } from '../config/env.ts';

function getAllowedOrigins(): string[] {
  const origins = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  if (env.APP_URL) {
    origins.add(env.APP_URL.replace(/\/$/, ''));
  }

  if (env.CORS_ORIGIN) {
    for (const item of env.CORS_ORIGIN.split(',')) {
      const trimmed = item.trim().replace(/\/$/, '');
      if (trimmed) {
        origins.add(trimmed);
      }
    }
  }

  return Array.from(origins);
}

export const securityHeadersMiddleware: RequestHandler = helmet({
  // Allow embedding inside AI Studio preview iframe while retaining baseline hardening
  frameguard: false,
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

export const corsMiddleware: RequestHandler = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowed = getAllowedOrigins();
    const normalized = origin.replace(/\/$/, '');
    if (allowed.includes(normalized) || normalized.endsWith('.run.app')) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not permitted by CORS policy'));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Demo-Role',
    'X-Demo-User',
    'X-Demo-Institution',
  ],
  credentials: false,
  maxAge: 600,
});
