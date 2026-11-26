import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        const parsedParams = schemas.params.safeParse(req.params);
        if (!parsedParams.success) {
          res.status(400).json({
            status: 'error',
            message: 'Invalid route parameters provided.',
          });
          return;
        }
        req.params = parsedParams.data as Record<string, string>;
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.safeParse(req.query);
        if (!parsedQuery.success) {
          res.status(400).json({
            status: 'error',
            message: 'Invalid search or filter parameters provided.',
          });
          return;
        }
        (req as Request & { validatedQuery?: unknown }).validatedQuery = parsedQuery.data;
      }

      if (schemas.body) {
        const parsedBody = schemas.body.safeParse(req.body);
        if (!parsedBody.success) {
          res.status(400).json({
            status: 'error',
            message: 'Request payload failed validation checks.',
          });
          return;
        }
        req.body = parsedBody.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
