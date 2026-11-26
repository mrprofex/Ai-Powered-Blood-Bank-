import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.ts';

export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

export const notFoundApiHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Requested API resource was not found.',
  });
};

export const centralizedErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const statusCode =
    err instanceof HttpError
      ? err.statusCode
      : err?.message === 'Origin not permitted by CORS policy'
        ? 403
        : 500;

  const clientMessage =
    statusCode < 500 && err instanceof Error
      ? err.message
      : 'An unexpected server error occurred. Please try again later.';

  const errorDetails: Record<string, unknown> = {
    level: 'error',
    method: req.method,
    path: req.path,
    statusCode,
    errorName: err instanceof Error ? err.name : 'UnknownError',
    timestamp: new Date().toISOString(),
  };

  if (env.NODE_ENV === 'development' && err instanceof Error) {
    errorDetails.message = err.message;
    errorDetails.stack = err.stack;
  }

  console.error(JSON.stringify(errorDetails));

  res.status(statusCode).json({
    status: 'error',
    message: clientMessage,
  });
};
