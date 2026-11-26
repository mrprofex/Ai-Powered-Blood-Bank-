import {
  BLOOD_GROUPS,
  type BloodComponent,
  type BloodGroup,
  type RiskLevel,
  type StockMovementType,
} from '../../../shared/constants/bloodNetwork.ts';
import type {
  BloodInventoryBatchRecord,
  BloodInventoryRecord,
  DemoStockMovement,
  NearbyBloodBankMatch,
} from '../../../shared/types/network.ts';
import type {
  BloodStockUpdateInput,
  InventoryBatchImportRow,
  NearbyMatchQueryInput,
} from '../../../shared/schemas/networkSchemas.ts';
import { DEMO_BLOOD_INVENTORY } from '../data/demoNetworkData.ts';
import {
  appendDemoAuditLog,
  demoStockMovementsStore,
} from '../data/demoOperationsStore.ts';
import type { DemoActorContext } from '../middleware/rbac.ts';
import { HttpError } from '../middleware/errorHandler.ts';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const CITY_CENTERS: Record<string, { state: string; latitude: number; longitude: number }> = {
  bengaluru: { state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  chennai: { state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  delhi: { state: 'Delhi NCR', latitude: 28.6139, longitude: 77.209 },
  'new delhi': { state: 'Delhi NCR', latitude: 28.6139, longitude: 77.209 },
  hyderabad: { state: 'Telangana', latitude: 17.385, longitude: 78.4867 },
  kolkata: { state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  mumbai: { state: 'Maharashtra', latitude: 19.076, longitude: 72.8777 },
  mysuru: { state: 'Karnataka', latitude: 12.2958, longitude: 76.6394 },
  pune: { state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
};

function cityCoordinates(
  city: string,
  state: string,
): { latitude: number | null; longitude: number | null; state: string } {
  const known = CITY_CENTERS[city.trim().toLowerCase()];
  return {
    latitude: known?.latitude ?? null,
    longitude: known?.longitude ?? null,
    state: known?.state ?? state,
  };
}

function addDays(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

function addHours(hours: number): string {
  return new Date(Date.now() + hours * HOUR_MS).toISOString().slice(0, 10);
}

function seededBatch(
  record: (typeof DEMO_BLOOD_INVENTORY)[number],
  suffix: string,
  unitsAvailable: number,
  expiryDate: string,
): BloodInventoryBatchRecord {
  const coordinates = cityCoordinates(record.city, record.state);
  return {
    id: `${record.id}-${suffix.toLowerCase()}`,
    batchCode: `${record.id.toUpperCase()}-${suffix}`,
    organizationName: record.facilityName,
    facilityType: record.facilityType,
    city: record.city,
    state: record.state,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    bloodGroup: record.bloodGroup,
    component: record.component,
    unitsAvailable,
    unitsReserved: 0,
    storageUnit: 'Demo storage location',
    expiryDate,
    sourceStatus: 'DEMO',
    sourceLabel: 'Synthetic demo inventory; not a live facility feed',
    lastUpdatedAt: new Date().toISOString(),
    isDemoData: true,
  };
}

export const demoInventoryBatchesStore: BloodInventoryBatchRecord[] =
  DEMO_BLOOD_INVENTORY.flatMap((record) => {
    const expiringUnits = Math.min(record.expiringWithin72h, record.unitsAvailable);
    const nonExpiringUnits = record.unitsAvailable - expiringUnits;
    const batches: BloodInventoryBatchRecord[] = [];
    if (expiringUnits > 0) {
      batches.push(seededBatch(record, 'EXPIRING', expiringUnits, addHours(48)));
    }
    if (nonExpiringUnits > 0) {
      batches.push(seededBatch(record, 'STOCK', nonExpiringUnits, addDays(90)));
    }
    return batches;
  });

function isUsable(batch: BloodInventoryBatchRecord, now = Date.now()): boolean {
  return new Date(`${batch.expiryDate}T23:59:59.999Z`).getTime() > now;
}

function availableUnits(batch: BloodInventoryBatchRecord): number {
  return Math.max(0, batch.unitsAvailable - batch.unitsReserved);
}

function isSameBatch(
  batch: BloodInventoryBatchRecord,
  organizationName: string,
  batchCode: string,
): boolean {
  return (
    batch.organizationName.toLowerCase() === organizationName.toLowerCase() &&
    batch.batchCode.toLowerCase() === batchCode.toLowerCase()
  );
}

function getLocation(
  city: string,
  state: string,
  latitude?: number,
  longitude?: number,
) {
  if (latitude !== undefined && longitude !== undefined) {
    return { latitude, longitude, state };
  }
  return cityCoordinates(city, state);
}

function makeBatch(
  organizationName: string,
  batchCode: string,
  bloodGroup: BloodGroup,
  component: BloodComponent,
  unitsAvailable: number,
  expiryDate: string,
  storageUnit: string,
  city: string,
  state: string,
  latitude?: number,
  longitude?: number,
): BloodInventoryBatchRecord {
  const location = getLocation(city, state, latitude, longitude);
  return {
    id: `INV-DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    batchCode,
    organizationName,
    facilityType: 'BLOOD_BANK',
    city,
    state: location.state,
    latitude: location.latitude,
    longitude: location.longitude,
    bloodGroup,
    component,
    unitsAvailable,
    unitsReserved: 0,
    storageUnit,
    expiryDate,
    sourceStatus: 'DEMO',
    sourceLabel: 'Demo manual entry; not verified against a live system',
    lastUpdatedAt: new Date().toISOString(),
    isDemoData: true,
  };
}

export function listInventoryBatches(
  organizationName?: string,
): BloodInventoryBatchRecord[] {
  return demoInventoryBatchesStore
    .filter(
      (batch) =>
        !organizationName ||
        batch.organizationName.toLowerCase() === organizationName.toLowerCase(),
    )
    .sort((left, right) => left.expiryDate.localeCompare(right.expiryDate));
}

function makeMovement(
  actor: DemoActorContext,
  input: BloodStockUpdateInput,
  previousUnits: number,
  resultingUnits: number,
): DemoStockMovement {
  const isCountedMovement =
    input.movementType === 'DISPATCH_OUT' || input.movementType === 'EXPIRY_FLAG';
  const signedDelta =
    input.movementType === 'UPDATE_STOCK'
      ? resultingUnits - previousUnits
      : isCountedMovement
        ? -input.unitsDelta
        : input.unitsDelta;

  return {
    id: `MOV-DEMO-${Date.now().toString().slice(-6)}`,
    batchCode: input.batchCode,
    bloodGroup: input.bloodGroup,
    component: input.component,
    movementType: input.movementType,
    unitsDelta: signedDelta,
    resultingUnits,
    storageUnit: input.storageUnit,
    expiryDate: input.expiryDate,
    counterparty: input.counterparty,
    notes: input.notes,
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    timestamp: new Date().toISOString(),
    isDemoData: true,
  };
}

export function recordInventoryMovement(
  actor: DemoActorContext,
  input: BloodStockUpdateInput,
): DemoStockMovement {
  const existing = demoInventoryBatchesStore.find((batch) =>
    isSameBatch(batch, actor.institutionName, input.batchCode),
  );
  const subtractsStock =
    input.movementType === 'DISPATCH_OUT' || input.movementType === 'EXPIRY_FLAG';

  if (!existing && subtractsStock) {
    throw new HttpError(409, 'Cannot dispatch or write off stock from an unknown batch.');
  }
  if (
    existing &&
    subtractsStock &&
    (!isUsable(existing) || availableUnits(existing) < input.unitsDelta)
  ) {
    throw new HttpError(
      409,
      isUsable(existing)
        ? 'The requested movement exceeds unreserved batch units.'
        : 'Expired stock cannot be dispatched or written off through this movement.',
    );
  }
  if (
    existing &&
    (existing.bloodGroup !== input.bloodGroup || existing.component !== input.component)
  ) {
    throw new HttpError(409, 'The batch blood group and component cannot be changed.');
  }

  const previousUnits = existing?.unitsAvailable ?? 0;
  const resultingUnits =
    input.movementType === 'UPDATE_STOCK'
      ? input.unitsDelta
      : subtractsStock
        ? previousUnits - input.unitsDelta
        : previousUnits + input.unitsDelta;
  const city = input.city ?? actor.city ?? 'Unknown location';
  const state = input.state ?? actor.state ?? 'Unknown state';

  if (existing) {
    existing.unitsAvailable = resultingUnits;
    existing.expiryDate = input.expiryDate.slice(0, 10);
    existing.storageUnit = input.storageUnit;
    existing.city = city;
    existing.state = state;
    const location = getLocation(city, state, input.latitude, input.longitude);
    existing.latitude = location.latitude;
    existing.longitude = location.longitude;
    existing.lastUpdatedAt = new Date().toISOString();
    existing.sourceLabel = 'Demo manual inventory update; not a live facility feed';
  } else {
    demoInventoryBatchesStore.unshift(
      makeBatch(
        actor.institutionName,
        input.batchCode,
        input.bloodGroup,
        input.component,
        resultingUnits,
        input.expiryDate.slice(0, 10),
        input.storageUnit,
        city,
        state,
        input.latitude,
        input.longitude,
      ),
    );
  }

  const movement = makeMovement(actor, input, previousUnits, resultingUnits);
  demoStockMovementsStore.unshift(movement);
  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: `INVENTORY_${input.movementType}`,
    target: input.batchCode,
    outcome: 'ALLOWED',
    details: `${input.movementType} recorded for ${input.unitsDelta} ${input.bloodGroup} ${input.component} units; resulting batch balance ${resultingUnits}.`,
  });
  return movement;
}

export function importInventoryBatches(
  actor: DemoActorContext,
  rows: InventoryBatchImportRow[],
): BloodInventoryBatchRecord[] {
  const batchCodes = rows.map((row) => row.batchCode.toLowerCase());
  if (new Set(batchCodes).size !== batchCodes.length) {
    throw new HttpError(400, 'The import contains duplicate batch codes.');
  }

  for (const row of rows) {
    const current = demoInventoryBatchesStore.find((batch) =>
      isSameBatch(batch, actor.institutionName, row.batchCode),
    );
    if (
      current &&
      (current.bloodGroup !== row.bloodGroup || current.component !== row.component)
    ) {
      throw new HttpError(
        409,
        `Batch ${row.batchCode} already exists with a different blood group or component.`,
      );
    }
  }

  const now = new Date().toISOString();
  const saved = rows.map((row, index) => {
    const current = demoInventoryBatchesStore.find((batch) =>
      isSameBatch(batch, actor.institutionName, row.batchCode),
    );
    const previousUnits = current?.unitsAvailable ?? 0;
    let savedBatch: BloodInventoryBatchRecord;
    if (current) {
      current.bloodGroup = row.bloodGroup;
      current.component = row.component;
      current.unitsAvailable = row.unitsAvailable;
      current.expiryDate = row.expiryDate;
      current.storageUnit = row.storageUnit;
      current.city = row.city;
      current.state = row.state;
      const location = getLocation(row.city, row.state, row.latitude, row.longitude);
      current.latitude = location.latitude;
      current.longitude = location.longitude;
      current.lastUpdatedAt = now;
      current.sourceLabel = 'Demo spreadsheet import; not a live facility feed';
      savedBatch = current;
    } else {
      savedBatch = makeBatch(
        actor.institutionName,
        row.batchCode,
        row.bloodGroup,
        row.component,
        row.unitsAvailable,
        row.expiryDate,
        row.storageUnit,
        row.city,
        row.state,
        row.latitude,
        row.longitude,
      );
      savedBatch.lastUpdatedAt = now;
      savedBatch.sourceLabel = 'Demo spreadsheet import; not a live facility feed';
      demoInventoryBatchesStore.unshift(savedBatch);
    }

    demoStockMovementsStore.unshift({
      id: `MOV-DEMO-IMPORT-${Date.now()}-${index}`,
      batchCode: row.batchCode,
      bloodGroup: row.bloodGroup,
      component: row.component,
      movementType: 'UPDATE_STOCK',
      unitsDelta: row.unitsAvailable - previousUnits,
      resultingUnits: row.unitsAvailable,
      storageUnit: row.storageUnit,
      expiryDate: row.expiryDate,
      actorName: actor.userName,
      actorRole: actor.role,
      institutionName: actor.institutionName,
      timestamp: now,
      isDemoData: true,
    });
    return savedBatch;
  });

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: 'INVENTORY_SPREADSHEET_IMPORT',
    target: `${saved.length} batches`,
    outcome: 'ALLOWED',
    details: `Imported or reconciled ${saved.length} batch rows from a demo spreadsheet upload.`,
  });
  return saved;
}

function haversineKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function findNearbyBloodBankMatches(
  query: NearbyMatchQueryInput,
): NearbyBloodBankMatch[] {
  const now = Date.now();
  const matches = new Map<string, {
    bloodBankName: string;
    city: string;
    state: string;
    distanceKm: number;
    availableUnits: number;
    earliestExpiry: string;
  }>();

  for (const batch of demoInventoryBatchesStore) {
    if (
      batch.facilityType !== 'BLOOD_BANK' ||
      batch.bloodGroup !== query.bloodGroup ||
      batch.component !== query.component ||
      !isUsable(batch, now) ||
      batch.latitude === null ||
      batch.longitude === null
    ) {
      continue;
    }
    const units = availableUnits(batch);
    if (units <= 0) continue;

    const distanceKm = haversineKm(
      query.latitude,
      query.longitude,
      batch.latitude,
      batch.longitude,
    );
    if (distanceKm > query.radiusKm) continue;

    const matchKey = `${batch.organizationName}|${batch.city}|${batch.state}|${batch.latitude}|${batch.longitude}`;
    const current = matches.get(matchKey);
    if (current) {
      current.availableUnits += units;
      current.earliestExpiry =
        current.earliestExpiry < batch.expiryDate ? current.earliestExpiry : batch.expiryDate;
    } else {
      matches.set(matchKey, {
        bloodBankName: batch.organizationName,
        city: batch.city,
        state: batch.state,
        distanceKm,
        availableUnits: units,
        earliestExpiry: batch.expiryDate,
      });
    }
  }

  return Array.from(matches.values())
    .map((match) => ({
      ...match,
      distanceKm: Math.round(match.distanceKm * 10) / 10,
      requestedUnits: query.units,
      canFulfillRequest: match.availableUnits >= query.units,
      estimatedTravelMinutes: Math.max(1, Math.ceil((match.distanceKm / 30) * 60)),
      isDemoData: true as const,
    }))
    .sort(
      (left, right) =>
        Number(right.canFulfillRequest) - Number(left.canFulfillRequest) ||
        left.distanceKm - right.distanceKm ||
        left.earliestExpiry.localeCompare(right.earliestExpiry),
    );
}

export function findMatchesForCityRequest(input: {
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  city: string;
  latitude?: number;
  longitude?: number;
}): NearbyBloodBankMatch[] {
  const location = getLocation(input.city, '', input.latitude, input.longitude);
  if (location.latitude === null || location.longitude === null) return [];
  return findNearbyBloodBankMatches({
    bloodGroup: input.bloodGroup,
    component: input.component,
    units: input.units,
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm: 250,
  });
}

function calculateRisk(daysOfCover: number): RiskLevel {
  if (daysOfCover <= 2.5) return 'CRITICAL';
  if (daysOfCover <= 5) return 'MODERATE';
  return 'LOW';
}

export function getAvailabilityRecords(): BloodInventoryRecord[] {
  const baseKeys = new Set<string>();
  const results: BloodInventoryRecord[] = DEMO_BLOOD_INVENTORY.map((base) => {
    const key = `${base.facilityName}|${base.bloodGroup}|${base.component}`;
    baseKeys.add(key);
    const batches = demoInventoryBatchesStore.filter(
      (batch) =>
        batch.organizationName === base.facilityName &&
        batch.bloodGroup === base.bloodGroup &&
        batch.component === base.component,
    );
    const current = batches.filter((batch) => isUsable(batch));
    const unitsAvailable = current.reduce((sum, batch) => sum + availableUnits(batch), 0);
    const expiringWithin72h = current
      .filter((batch) => new Date(`${batch.expiryDate}T00:00:00.000Z`).getTime() <= Date.now() + 72 * HOUR_MS)
      .reduce((sum, batch) => sum + availableUnits(batch), 0);
    const dailyConsumption = base.unitsAvailable / Math.max(0.1, base.daysOfCover);
    const daysOfCover = unitsAvailable / dailyConsumption;
    const lastUpdatedAt = batches
      .map((batch) => batch.lastUpdatedAt)
      .sort()
      .at(-1) ?? base.lastUpdatedAt;
    return {
      ...base,
      unitsAvailable,
      expiringWithin72h,
      daysOfCover: Math.round(daysOfCover * 10) / 10,
      riskLevel: calculateRisk(daysOfCover),
      sourceLabel: 'Demo inventory store; synthetic network records',
      lastUpdatedAt,
    };
  });

  const extraGroups = new Map<string, BloodInventoryBatchRecord[]>();
  for (const batch of demoInventoryBatchesStore) {
    const key = `${batch.organizationName}|${batch.bloodGroup}|${batch.component}`;
    if (baseKeys.has(key)) continue;
    const group = extraGroups.get(key) ?? [];
    group.push(batch);
    extraGroups.set(key, group);
  }

  for (const batches of extraGroups.values()) {
    const first = batches[0];
    const current = batches.filter((batch) => isUsable(batch));
    const unitsAvailable = current.reduce((sum, batch) => sum + availableUnits(batch), 0);
    const expiringWithin72h = current
      .filter((batch) => new Date(`${batch.expiryDate}T00:00:00.000Z`).getTime() <= Date.now() + 72 * HOUR_MS)
      .reduce((sum, batch) => sum + availableUnits(batch), 0);
    results.push({
      id: first.id,
      facilityName: first.organizationName,
      facilityType: first.facilityType,
      city: first.city,
      state: first.state,
      bloodGroup: first.bloodGroup,
      component: first.component,
      unitsAvailable,
      expiringWithin72h,
      daysOfCover: 5,
      riskLevel: calculateRisk(5),
      sourceStatus: 'DEMO',
      sourceLabel: 'Demo manual or spreadsheet entry; not a live facility feed',
      lastUpdatedAt: batches.map((batch) => batch.lastUpdatedAt).sort().at(-1) ?? first.lastUpdatedAt,
      contactPhone: 'Not supplied in demo inventory',
      isDemoData: true,
    });
  }

  return results;
}

export function getExpiryAlerts(
  organizationName?: string,
): Array<{
  batchCode: string;
  bloodBankName: string;
  city: string;
  state: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  expiryDate: string;
  hoursUntilExpiry: number;
  status: 'EXPIRED' | 'EXPIRING';
  isDemoData: true;
}> {
  const now = Date.now();
  return demoInventoryBatchesStore
    .filter(
      (batch) =>
        batch.facilityType === 'BLOOD_BANK' &&
        (!organizationName ||
          batch.organizationName.toLowerCase() === organizationName.toLowerCase()),
    )
    .map((batch) => {
      const expiryTime = new Date(`${batch.expiryDate}T23:59:59.999Z`).getTime();
      const hoursUntilExpiry = Math.floor((expiryTime - now) / HOUR_MS);
      return {
        batch,
        hoursUntilExpiry,
      };
    })
    .filter(({ batch, hoursUntilExpiry }) => availableUnits(batch) > 0 && hoursUntilExpiry <= 72)
    .map(({ batch, hoursUntilExpiry }) => ({
      batchCode: batch.batchCode,
      bloodBankName: batch.organizationName,
      city: batch.city,
      state: batch.state,
      bloodGroup: batch.bloodGroup,
      component: batch.component,
      unitsAvailable: availableUnits(batch),
      expiryDate: batch.expiryDate,
      hoursUntilExpiry,
      status: hoursUntilExpiry < 0 ? ('EXPIRED' as const) : ('EXPIRING' as const),
      isDemoData: true as const,
    }))
    .sort((left, right) => left.hoursUntilExpiry - right.hoursUntilExpiry);
}

export function getInventoryBatchByCode(
  organizationName: string,
  batchCode: string,
): BloodInventoryBatchRecord | undefined {
  return demoInventoryBatchesStore.find((batch) =>
    isSameBatch(batch, organizationName, batchCode),
  );
}

export function getBloodGroupsWithInventory(): BloodGroup[] {
  return BLOOD_GROUPS.filter((group) =>
    demoInventoryBatchesStore.some((batch) => batch.bloodGroup === group),
  );
}
