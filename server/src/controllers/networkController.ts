import type { Request, Response } from 'express';
import type {
  AvailabilityQueryInput,
  DemoRequestValidationInput,
} from '../../../shared/schemas/networkSchemas.ts';
import {
  DEMO_BLOOD_INVENTORY,
  DEMO_NETWORK_SUMMARY,
} from '../data/demoNetworkData.ts';

export function getNetworkSummary(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'success',
    data: DEMO_NETWORK_SUMMARY,
  });
}

export function getBloodAvailability(req: Request, res: Response): void {
  const query = (req as Request & { validatedQuery?: AvailabilityQueryInput }).validatedQuery ?? {
    limit: 25,
  };

  const searchLower = query.search?.toLowerCase();

  const filtered = DEMO_BLOOD_INVENTORY.filter((record) => {
    if (query.bloodGroup && record.bloodGroup !== query.bloodGroup) {
      return false;
    }
    if (query.component && record.component !== query.component) {
      return false;
    }
    if (query.state && record.state.toLowerCase() !== query.state.toLowerCase()) {
      return false;
    }
    if (query.riskLevel && record.riskLevel !== query.riskLevel) {
      return false;
    }
    if (searchLower) {
      const haystack = `${record.facilityName} ${record.city} ${record.state}`.toLowerCase();
      if (!haystack.includes(searchLower)) {
        return false;
      }
    }
    return true;
  }).slice(0, query.limit);

  res.status(200).json({
    status: 'success',
    meta: {
      isDemoData: true,
      total: filtered.length,
      disclaimer:
        'DEMO DATA ONLY: Blood availability figures shown are synthetic Phase 1 records for interface verification.',
    },
    data: filtered,
  });
}

export function validateDemoRequest(req: Request, res: Response): void {
  const payload = req.body as DemoRequestValidationInput;

  res.status(200).json({
    status: 'success',
    meta: {
      isDemoData: true,
      persisted: false,
    },
    message:
      'Request passed Zod validation in Phase 1 demo mode. Database persistence activates in Phase 4.',
    data: {
      previewRequestId: `DEMO-REQ-${Date.now()}`,
      ...payload,
    },
  });
}
