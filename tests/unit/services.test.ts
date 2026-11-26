import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateShortageForecasts, getShortagePredictionResponse } from '../../server/src/services/predictionService.ts';
import { findNearbyBloodBankMatches, getAvailabilityRecords, getExpiryAlerts, listInventoryBatches } from '../../server/src/services/inventoryService.ts';
import { getIntegrationReadiness } from '../../server/src/services/externalIntegrationService.ts';
import type { NearbyMatchQueryInput } from '../../shared/schemas/networkSchemas.ts';
import type { DemoActorContext } from '../../server/src/middleware/rbac.ts';

vi.mock('../../server/src/config/env.ts', () => ({
  env: {
    GEMINI_API_KEY: '',
    HOSPITAL_SYSTEM_API_BASE_URL: '',
    HOSPITAL_SYSTEM_API_KEY: '',
    BLOOD_BANK_SYSTEM_API_BASE_URL: '',
    BLOOD_BANK_SYSTEM_API_KEY: '',
    ERAKTKOSH_API_BASE_URL: '',
    ERAKTKOSH_API_KEY: '',
  },
}));

describe('Prediction Service', () => {
  describe('calculateShortageForecasts', () => {
    it('returns array of forecast items', () => {
      const forecasts = calculateShortageForecasts();
      expect(Array.isArray(forecasts)).toBe(true);
      expect(forecasts.length).toBeGreaterThan(0);
    });

    it('each forecast has required fields', () => {
      const forecasts = calculateShortageForecasts();
      for (const forecast of forecasts) {
        expect(forecast).toHaveProperty('bloodGroup');
        expect(forecast).toHaveProperty('component');
        expect(forecast).toHaveProperty('currentUnits');
        expect(forecast).toHaveProperty('dailyConsumptionEstimate');
        expect(forecast).toHaveProperty('daysOfCover');
        expect(forecast).toHaveProperty('expiringWithin72h');
        expect(forecast).toHaveProperty('projected7DayDemand');
        expect(forecast).toHaveProperty('projected30DayDemand');
        expect(forecast).toHaveProperty('projected7DayDeficit');
        expect(forecast).toHaveProperty('projected30DayDeficit');
        expect(forecast).toHaveProperty('riskScore');
        expect(forecast).toHaveProperty('riskLevel');
        expect(forecast).toHaveProperty('explanation');
        expect(forecast).toHaveProperty('region');
        expect(forecast).toHaveProperty('isDemoData');
        expect(forecast.isDemoData).toBe(true);
        expect(['LOW', 'MODERATE', 'CRITICAL']).toContain(forecast.riskLevel);
        expect(forecast.riskScore).toBeGreaterThanOrEqual(0);
        expect(forecast.riskScore).toBeLessThanOrEqual(100);
      }
    });

    it('forecasts are sorted by risk score descending', () => {
      const forecasts = calculateShortageForecasts();
      for (let i = 1; i < forecasts.length; i++) {
        expect(forecasts[i - 1].riskScore).toBeGreaterThanOrEqual(forecasts[i].riskScore);
      }
    });

    it('has forecasts for all blood groups present in demo data', () => {
      const forecasts = calculateShortageForecasts();
      const bloodGroups = new Set(forecasts.map(f => f.bloodGroup));
      expect(bloodGroups.size).toBeGreaterThan(0);
      expect(bloodGroups.size).toBeLessThanOrEqual(8);
    });
  });

  describe('getShortagePredictionResponse', () => {
    it('returns prediction response with rules-based mode when no Gemini key', async () => {
      const response = await getShortagePredictionResponse();
      expect(response).toHaveProperty('predictionMode');
      expect(response.predictionMode).toBe('RULES_BASED_DEMO');
      expect(response.isDemoData).toBe(true);
      expect(response.disclaimer).toBeDefined();
      expect(response.aiSummary).toBeDefined();
      expect(response.computedAt).toBeDefined();
      expect(response.data).toBeInstanceOf(Array);
    });

    it('includes all forecast items in response', async () => {
      const response = await getShortagePredictionResponse();
      expect(response.data.length).toBeGreaterThan(0);
    });
  });
});

describe('Inventory Service', () => {
  const mockActor: DemoActorContext = {
    role: 'BLOOD_BANK_OFFICER',
    userName: 'Test Officer',
    institutionName: 'Test Blood Bank',
    city: 'Mumbai',
    state: 'Maharashtra',
  };

  describe('getAvailabilityRecords', () => {
    it('returns array of availability records', () => {
      const records = getAvailabilityRecords();
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
    });

    it('each record has required fields', () => {
      const records = getAvailabilityRecords();
      for (const record of records) {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('facilityName');
        expect(record).toHaveProperty('facilityType');
        expect(record).toHaveProperty('city');
        expect(record).toHaveProperty('state');
        expect(record).toHaveProperty('bloodGroup');
        expect(record).toHaveProperty('component');
        expect(record).toHaveProperty('unitsAvailable');
        expect(record).toHaveProperty('expiringWithin72h');
        expect(record).toHaveProperty('daysOfCover');
        expect(record).toHaveProperty('riskLevel');
        expect(record).toHaveProperty('sourceStatus');
        expect(record).toHaveProperty('sourceLabel');
        expect(record).toHaveProperty('lastUpdatedAt');
        expect(record).toHaveProperty('contactPhone');
        expect(record.isDemoData).toBe(true);
      }
    });

    it('has records for multiple blood groups', () => {
      const records = getAvailabilityRecords();
      const bloodGroups = new Set(records.map(r => r.bloodGroup));
      expect(bloodGroups.size).toBeGreaterThan(1);
    });

    it('calculates days of cover correctly', () => {
      const records = getAvailabilityRecords();
      for (const record of records) {
        expect(record.daysOfCover).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('findNearbyBloodBankMatches', () => {
    it('returns matches for valid query', () => {
      const query: NearbyMatchQueryInput = {
        bloodGroup: 'O+',
        component: 'PRBC',
        units: 10,
        latitude: 19.0760,
        longitude: 72.8777,
        radiusKm: 100,
      };
      const matches = findNearbyBloodBankMatches(query);
      expect(Array.isArray(matches)).toBe(true);
    });

    it('each match has required fields', () => {
      const query: NearbyMatchQueryInput = {
        bloodGroup: 'O+',
        component: 'PRBC',
        units: 10,
        latitude: 19.0760,
        longitude: 72.8777,
        radiusKm: 100,
      };
      const matches = findNearbyBloodBankMatches(query);
      for (const match of matches) {
        expect(match).toHaveProperty('bloodBankName');
        expect(match).toHaveProperty('city');
        expect(match).toHaveProperty('state');
        expect(match).toHaveProperty('distanceKm');
        expect(match).toHaveProperty('availableUnits');
        expect(match).toHaveProperty('requestedUnits');
        expect(match).toHaveProperty('canFulfillRequest');
        expect(match).toHaveProperty('estimatedTravelMinutes');
        expect(match).toHaveProperty('earliestExpiry');
        expect(match.isDemoData).toBe(true);
      }
    });

    it('returns empty array for blood group with no inventory', () => {
      const query: NearbyMatchQueryInput = {
        bloodGroup: 'AB-',
        component: 'PLATELETS',
        units: 100,
        latitude: 0,
        longitude: 0,
        radiusKm: 10,
      };
      const matches = findNearbyBloodBankMatches(query);
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBe(0);
    });

    it('sorts matches by canFulfillRequest, then distance, then expiry', () => {
      const query: NearbyMatchQueryInput = {
        bloodGroup: 'O+',
        component: 'PRBC',
        units: 10,
        latitude: 19.0760,
        longitude: 72.8777,
        radiusKm: 200,
      };
      const matches = findNearbyBloodBankMatches(query);
      for (let i = 1; i < matches.length; i++) {
        const prev = matches[i - 1];
        const curr = matches[i];
        if (prev.canFulfillRequest !== curr.canFulfillRequest) {
          expect(prev.canFulfillRequest).toBe(true);
          expect(curr.canFulfillRequest).toBe(false);
        } else if (prev.distanceKm !== curr.distanceKm) {
          expect(prev.distanceKm).toBeLessThanOrEqual(curr.distanceKm);
        } else {
          expect(prev.earliestExpiry.localeCompare(curr.earliestExpiry)).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('getExpiryAlerts', () => {
    it('returns array of expiry alerts', () => {
      const alerts = getExpiryAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('each alert has required fields', () => {
      const alerts = getExpiryAlerts();
      for (const alert of alerts) {
        expect(alert).toHaveProperty('batchCode');
        expect(alert).toHaveProperty('bloodBankName');
        expect(alert).toHaveProperty('city');
        expect(alert).toHaveProperty('state');
        expect(alert).toHaveProperty('bloodGroup');
        expect(alert).toHaveProperty('component');
        expect(alert).toHaveProperty('unitsAvailable');
        expect(alert).toHaveProperty('expiryDate');
        expect(alert).toHaveProperty('hoursUntilExpiry');
        expect(alert).toHaveProperty('status');
        expect(['EXPIRED', 'EXPIRING']).toContain(alert.status);
        expect(alert.isDemoData).toBe(true);
      }
    });

    it('only returns alerts within 72 hours', () => {
      const alerts = getExpiryAlerts();
      for (const alert of alerts) {
        expect(alert.hoursUntilExpiry).toBeLessThanOrEqual(72);
      }
    });

    it('filters by organization name when provided', () => {
      const alerts = getExpiryAlerts('KEM Regional Blood Center (Demo)');
      for (const alert of alerts) {
        expect(alert.bloodBankName).toBe('KEM Regional Blood Center (Demo)');
      }
    });
  });

  describe('listInventoryBatches', () => {
    it('returns array of inventory batches', () => {
      const batches = listInventoryBatches();
      expect(Array.isArray(batches)).toBe(true);
      expect(batches.length).toBeGreaterThan(0);
    });

    it('each batch has required fields', () => {
      const batches = listInventoryBatches();
      for (const batch of batches) {
        expect(batch).toHaveProperty('id');
        expect(batch).toHaveProperty('batchCode');
        expect(batch).toHaveProperty('organizationName');
        expect(batch).toHaveProperty('facilityType');
        expect(batch).toHaveProperty('city');
        expect(batch).toHaveProperty('state');
        expect(batch).toHaveProperty('bloodGroup');
        expect(batch).toHaveProperty('component');
        expect(batch).toHaveProperty('unitsAvailable');
        expect(batch).toHaveProperty('unitsReserved');
        expect(batch).toHaveProperty('storageUnit');
        expect(batch).toHaveProperty('expiryDate');
        expect(batch).toHaveProperty('sourceStatus');
        expect(batch).toHaveProperty('sourceLabel');
        expect(batch).toHaveProperty('lastUpdatedAt');
        expect(batch.isDemoData).toBe(true);
      }
    });

    it('filters by organization name when provided', () => {
      const batches = listInventoryBatches('KEM Regional Blood Center (Demo)');
      for (const batch of batches) {
        expect(batch.organizationName).toBe('KEM Regional Blood Center (Demo)');
      }
    });

    it('sorts by expiry date ascending', () => {
      const batches = listInventoryBatches();
      for (let i = 1; i < batches.length; i++) {
        expect(batches[i - 1].expiryDate.localeCompare(batches[i].expiryDate)).toBeLessThanOrEqual(0);
      }
    });
  });
});

describe('External Integration Service', () => {
  describe('getIntegrationReadiness', () => {
    it('returns readiness for all providers', () => {
      const readiness = getIntegrationReadiness();
      expect(Array.isArray(readiness)).toBe(true);
      expect(readiness.length).toBe(4);
    });

    it('includes all required providers', () => {
      const readiness = getIntegrationReadiness();
      const providers = readiness.map(r => r.provider);
      expect(providers).toContain('HOSPITAL_SYSTEM');
      expect(providers).toContain('BLOOD_BANK_SYSTEM');
      expect(providers).toContain('ERAKTKOSH');
      expect(providers).toContain('GEMINI');
    });

    it('each readiness item has required fields', () => {
      const readiness = getIntegrationReadiness();
      for (const item of readiness) {
        expect(item).toHaveProperty('provider');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('configured');
        expect(item).toHaveProperty('message');
        expect(['NOT_CONFIGURED', 'CONFIGURED_NOT_VERIFIED', 'READY_FOR_AUTHORIZED_SETUP']).toContain(item.status);
        expect(typeof item.configured).toBe('boolean');
      }
    });
  });
});