import type { NextFunction, Request, Response } from 'express';
import {
  USER_ROLES,
  type UserRole,
} from '../../../shared/constants/bloodNetwork.ts';
import { appendDemoAuditLog } from '../data/demoOperationsStore.ts';

export interface DemoActorContext {
  role: UserRole;
  userName: string;
  institutionName: string;
}

export function extractDemoActor(req: Request): DemoActorContext {
  const rawRole = String(req.header('x-demo-role') ?? 'PUBLIC').toUpperCase();
  const role: UserRole = (USER_ROLES as readonly string[]).includes(rawRole)
    ? (rawRole as UserRole)
    : 'PUBLIC';

  const userName = String(req.header('x-demo-user') ?? 'Public Session (Demo)').slice(0, 120);
  const institutionName = String(
    req.header('x-demo-institution') ?? 'Public Portal Session (Demo)',
  ).slice(0, 150);

  return { role, userName, institutionName };
}

export function requireRole(allowedRoles: UserRole[], actionLabel: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const actor = extractDemoActor(req);
    (req as Request & { demoActor?: DemoActorContext }).demoActor = actor;

    if (!allowedRoles.includes(actor.role)) {
      appendDemoAuditLog({
        actorName: actor.userName,
        actorRole: actor.role,
        institutionName: actor.institutionName,
        action: actionLabel,
        target: req.originalUrl,
        outcome: 'DENIED',
        details: `Role ${actor.role} attempted ${actionLabel} without required authorization (${allowedRoles.join(', ')}).`,
      });

      res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: `Access denied for role ${actor.role}. Required role: ${allowedRoles.join(' or ')}.`,
      });
      return;
    }

    next();
  };
}
