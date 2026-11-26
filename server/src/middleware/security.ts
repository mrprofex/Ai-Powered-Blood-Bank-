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

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://maps.googleapis.com', 'https://*.googleapis.com'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
  connectSrc: ["'self'", 'https://maps.googleapis.com', 'https://*.googleapis.com', 'wss:', 'https://*.vercel.app'],
  frameSrc: ["'self'", 'https://*.vercel.app'],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : undefined,
};

export const securityHeadersMiddleware: RequestHandler = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? { directives: cspDirectives } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

export const corsMiddleware: RequestHandler = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowed = getAllowedOrigins();
    const normalized = origin.replace(/\/$/, '');
    if (allowed.includes(normalized) || normalized.endsWith('.vercel.app')) {
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
  credentials: true,
  maxAge: 600,
});

export const securityAuditMiddleware: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      level: 'info',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.get('user-agent')?.slice(0, 200),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };
    if (res.statusCode >= 400 || duration > 1000) {
      console.warn(JSON.stringify({ ...logData, level: 'warn' }));
    } else {
      console.log(JSON.stringify(logData));
    }
  });
  next();
};