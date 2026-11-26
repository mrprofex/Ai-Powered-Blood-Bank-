import express from 'express';
import {
  centralizedErrorHandler,
  notFoundApiHandler,
} from './middleware/errorHandler.ts';
import {
  corsMiddleware,
  securityHeadersMiddleware,
  securityAuditMiddleware,
} from './middleware/security.ts';
import {
  createAuthRateLimiter,
  createPublicRateLimiter,
  createAuthenticatedRateLimiter,
} from './middleware/rateLimit.ts';
import { apiRouter } from './routes/index.ts';

export function createApiApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);
  app.use(securityAuditMiddleware);
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: false, limit: '64kb' }));

  app.use('/api', createPublicRateLimiter());
  app.use('/api/auth', createAuthRateLimiter());
  app.use('/api/v1', createAuthenticatedRateLimiter());

  app.use('/api', apiRouter);
  app.use('/api', notFoundApiHandler);
  app.use(centralizedErrorHandler);

  return app;
}
