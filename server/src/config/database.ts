import { env } from './env.ts';

/**
 * Neon PostgreSQL + Prisma Configuration Blueprint (Phase 1)
 *
 * Phase 1 intentionally avoids connecting to a live database.
 * Once Neon PostgreSQL credentials are provided in Phase 2,
 * initialize PrismaClient using @prisma/client and connection pooling.
 */
export interface DatabaseConfigStatus {
  provider: 'neon-postgresql';
  orm: 'prisma';
  schemaPath: string;
  configured: boolean;
  poolingEnabled: boolean;
  mode: 'configuration-only';
}

export function getDatabaseConfigStatus(): DatabaseConfigStatus {
  const hasConnectionString = Boolean(env.DATABASE_URL && env.DATABASE_URL.length > 0);
  const poolingEnabled = env.DATABASE_URL.includes('-pooler');

  return {
    provider: 'neon-postgresql',
    orm: 'prisma',
    schemaPath: 'server/prisma/schema.prisma',
    configured: hasConnectionString,
    poolingEnabled,
    mode: 'configuration-only',
  };
}
