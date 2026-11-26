import express from 'express';
import {
  centralizedErrorHandler,
  notFoundApiHandler,
} from './middleware/errorHandler.ts';
import {
  corsMiddleware,
  securityHeadersMiddleware,
} from './middleware/security.ts';
import { apiRouter } from './routes/index.ts';

export function createApiApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: false, limit: '64kb' }));

  app.use('/api', apiRouter);
  app.use('/api', notFoundApiHandler);
  app.use(centralizedErrorHandler);

  return app;
}
