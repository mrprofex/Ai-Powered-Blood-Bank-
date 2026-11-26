import rateLimit from 'express-rate-limit';
import type { Request, RequestHandler } from 'express';
import { env } from '../config/env.ts';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

interface UserWithId {
  id?: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserWithId;
}

function getRateLimitConfig(category: 'auth' | 'public' | 'authenticated' | 'admin'): RateLimitConfig {
  const baseWindowMs = env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000;

  switch (category) {
    case 'auth':
      return {
        windowMs: baseWindowMs,
        max: env.RATE_LIMIT_AUTH_MAX ?? 5,
        message: 'Too many authentication attempts. Please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
      };
    case 'public':
      return {
        windowMs: baseWindowMs,
        max: env.RATE_LIMIT_PUBLIC_MAX ?? 100,
        message: 'Too many requests. Please slow down.',
        standardHeaders: true,
        legacyHeaders: false,
      };
    case 'authenticated':
      return {
        windowMs: baseWindowMs,
        max: env.RATE_LIMIT_AUTHENTICATED_MAX ?? 300,
        message: 'Too many requests. Please slow down.',
        standardHeaders: true,
        legacyHeaders: false,
      };
    case 'admin':
      return {
        windowMs: baseWindowMs,
        max: env.RATE_LIMIT_ADMIN_MAX ?? 100,
        message: 'Too many admin requests. Please slow down.',
        standardHeaders: true,
        legacyHeaders: false,
      };
    default:
      return {
        windowMs: baseWindowMs,
        max: 100,
        message: 'Too many requests.',
        standardHeaders: true,
        legacyHeaders: false,
      };
  }
}

export function createRateLimiter(category: 'auth' | 'public' | 'authenticated' | 'admin'): RequestHandler {
  const config = getRateLimitConfig(category);

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { status: 'error', message: config.message },
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    keyGenerator: (req: Request) => {
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      return userId ? `${category}:user:${userId}` : `${category}:ip:${ip}`;
    },
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
  });
}

export function createAuthRateLimiter(): RequestHandler {
  return createRateLimiter('auth');
}

export function createPublicRateLimiter(): RequestHandler {
  return createRateLimiter('public');
}

export function createAuthenticatedRateLimiter(): RequestHandler {
  return createRateLimiter('authenticated');
}

export function createAdminRateLimiter(): RequestHandler {
  return createRateLimiter('admin');
}