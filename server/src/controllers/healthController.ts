import type { Request, Response } from 'express';
import type { HealthCheckResponse } from '../../../shared/types/network.ts';
import { getDatabaseConfigStatus } from '../config/database.ts';
import { env } from '../config/env.ts';

export function getHealthStatus(_req: Request, res: Response): void {
  const dbStatus = getDatabaseConfigStatus();

  const payload: HealthCheckResponse = {
    status: 'ok',
    service: 'predictive-emergency-blood-shortage-network',
    phase: 'phase-1-foundation',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: {
      provider: dbStatus.provider,
      orm: dbStatus.orm,
      configured: dbStatus.configured,
      mode: dbStatus.mode,
    },
    integrations: {
      geminiConfigured: Boolean(env.GEMINI_API_KEY),
      googleOAuthConfigured: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      eraktkoshConfigured: Boolean(env.ERAKTKOSH_API_BASE_URL && env.ERAKTKOSH_API_KEY),
    },
  };

  res.status(200).json(payload);
}
