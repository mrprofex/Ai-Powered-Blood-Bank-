import type { NextFunction, Request, Response } from 'express';
import type {
  AvailabilityQueryInput,
  DemoRequestValidationInput,
} from '../../../shared/schemas/networkSchemas.ts';
import {
  DEMO_BLOOD_INVENTORY,
  DEMO_NETWORK_SUMMARY,
} from '../data/demoNetworkData.ts';
import { getAvailabilityRecords } from '../services/inventoryService.ts';
import { getShortagePredictionResponse } from '../services/predictionService.ts';

function getUpdatedNetworkSummary() {
  const inventory = getAvailabilityRecords();
  const bloodGroupOverview = DEMO_NETWORK_SUMMARY.bloodGroupOverview.map((group) => {
    const seedUnits = DEMO_BLOOD_INVENTORY
      .filter((record) => record.bloodGroup === group.bloodGroup)
      .reduce((sum, record) => sum + record.unitsAvailable, 0);
    const currentUnits = inventory
      .filter((record) => record.bloodGroup === group.bloodGroup)
      .reduce((sum, record) => sum + record.unitsAvailable, 0);
    const unitsAvailable = Math.max(0, group.availableUnits + currentUnits - seedUnits);
    const baselineDailyUse = group.availableUnits / Math.max(group.daysOfCover, 0.1);
    const daysOfCover = unitsAvailable / baselineDailyUse;
    return {
      ...group,
      availableUnits: unitsAvailable,
      daysOfCover: Math.round(daysOfCover * 10) / 10,
      riskLevel: daysOfCover <= 2.5 ? 'CRITICAL' as const : daysOfCover <= 5 ? 'MODERATE' as const : 'LOW' as const,
    };
  });
  const availableBloodUnits = bloodGroupOverview.reduce(
    (sum, group) => sum + group.availableUnits,
    0,
  );
  return {
    ...DEMO_NETWORK_SUMMARY,
    kpis: {
      ...DEMO_NETWORK_SUMMARY.kpis,
      availableBloodUnits,
    },
    bloodGroupOverview,
  };
}

export function getNetworkSummary(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'success',
    data: getUpdatedNetworkSummary(),
  });
}

export function getBloodAvailability(req: Request, res: Response): void {
  const query = (req as Request & { validatedQuery?: AvailabilityQueryInput }).validatedQuery ?? {
    limit: 25,
  };

  const searchLower = query.search?.toLowerCase();

  const filtered = getAvailabilityRecords().filter((record) => {
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

export function getNetworkPredictions(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  getShortagePredictionResponse()
    .then((prediction) => {
      res.status(200).json({
        status: 'success',
        meta: {
          isDemoData: true,
          predictionMode: prediction.predictionMode,
          disclaimer: prediction.disclaimer,
          computedAt: prediction.computedAt,
        },
        data: prediction,
      });
    })
    .catch(next);
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
