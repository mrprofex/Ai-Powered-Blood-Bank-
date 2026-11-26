import type { Request, Response } from 'express';
import type {
  AdminEntityStatusInput,
  AdminVerificationActionInput,
  BloodStockUpdateInput,
  DemoRequestValidationInput,
  InventoryBatchImportInput,
  NearbyMatchQueryInput,
  OrganizationOnboardingInput,
  RequestStatusUpdateInput,
} from '../../../shared/schemas/networkSchemas.ts';
import type {
  DemoHospitalRequestRecord,
  DemoStockMovement,
  IntegrationReadiness,
  NearbyBloodBankMatch,
  OrganizationConnectionSummary,
} from '../../../shared/types/network.ts';
import {
  appendDemoAuditLog,
  demoAuditLogsStore,
  demoHospitalRequestsStore,
  demoInstitutionsStore,
  demoStockMovementsStore,
  demoUsersStore,
  demoVerificationsStore,
} from '../data/demoOperationsStore.ts';
import type { DemoActorContext } from '../middleware/rbac.ts';
import {
  findMatchesForCityRequest,
  getExpiryAlerts,
  importInventoryBatches,
  findNearbyBloodBankMatches,
  listInventoryBatches,
  recordInventoryMovement,
} from '../services/inventoryService.ts';
import { getIntegrationReadiness } from '../services/externalIntegrationService.ts';

function getActor(req: Request): DemoActorContext {
  return (
    (req as Request & { demoActor?: DemoActorContext }).demoActor ?? {
      role: 'PUBLIC',
      userName: 'Public Session (Demo)',
      institutionName: 'Public Portal Session (Demo)',
    }
  );
}

export function listHospitalRequests(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: demoHospitalRequestsStore,
  });
}

export function createHospitalRequest(req: Request, res: Response): void {
  const actor = getActor(req);
  const payload = req.body as DemoRequestValidationInput;
  const matchingCandidates = findMatchesForCityRequest({
    bloodGroup: payload.bloodGroup,
    component: payload.component,
    units: payload.unitsNeeded,
    city: payload.city,
    latitude: payload.latitude,
    longitude: payload.longitude,
  });
  const firstSuitableMatch = matchingCandidates.find((match) => match.canFulfillRequest);

  const newRequest: DemoHospitalRequestRecord = {
    id: `REQ-DEMO-${Date.now().toString().slice(-4)}`,
    department: payload.department,
    hospitalName: payload.hospitalName,
    city: payload.city,
    bloodGroup: payload.bloodGroup,
    component: payload.component,
    units: payload.unitsNeeded,
    urgency: payload.urgency,
    status: firstSuitableMatch ? 'MATCHED' : 'OPEN',
    matchedBank: firstSuitableMatch?.bloodBankName ?? 'No suitable nearby bank found',
    etaMinutes: firstSuitableMatch?.estimatedTravelMinutes ?? 0,
    createdAt: new Date().toISOString(),
    createdBy: actor.userName,
    notes: payload.notes,
    matchingCandidates,
    isDemoData: true,
  };

  demoHospitalRequestsStore.unshift(newRequest);

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: 'CREATE_BLOOD_REQUEST',
    target: newRequest.id,
    outcome: 'ALLOWED',
    details: `Created ${payload.urgency} demo request for ${payload.unitsNeeded}u ${payload.bloodGroup} ${payload.component} in ${payload.city}; ${matchingCandidates.length} nearby blood-bank candidates evaluated.`,
  });

  res.status(201).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    message: 'Demo blood request created and logged in audit trail (in-memory demo session).',
    data: newRequest,
  });
}

export function updateHospitalRequestStatus(req: Request, res: Response): void {
  const actor = getActor(req);
  const requestId = req.params.id;
  const payload = req.body as RequestStatusUpdateInput;

  const target = demoHospitalRequestsStore.find((item) => item.id === requestId);
  if (!target) {
    res.status(404).json({ status: 'error', message: 'Demo request record not found.' });
    return;
  }

  target.status = payload.status;
  if (payload.matchedBank) {
    target.matchedBank = payload.matchedBank;
  } else if (payload.status === 'MATCHED' || payload.status === 'ALLOCATED') {
    target.matchedBank = actor.institutionName;
  }

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: 'UPDATE_REQUEST_STATUS',
    target: target.id,
    outcome: 'ALLOWED',
    details: `Updated request ${target.id} status to ${payload.status} (${target.matchedBank}).`,
  });

  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: target,
  });
}

export function listStockMovements(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: demoStockMovementsStore,
  });
}

export function recordBloodStockUpdate(req: Request, res: Response): void {
  const actor = getActor(req);
  const payload = req.body as BloodStockUpdateInput;
  const movement = recordInventoryMovement(actor, payload);

  res.status(201).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    message: 'Inventory movement recorded with immutable audit entry (demo session).',
    data: movement,
  });
}

export function getInventoryBatches(req: Request, res: Response): void {
  const actor = getActor(req);
  res.status(200).json({
    status: 'success',
    meta: {
      isDemoData: true,
      persistence: 'PROCESS_MEMORY_ONLY',
      disclaimer: 'Demo inventory is kept in server memory and is not a live facility feed.',
    },
    data: listInventoryBatches(actor.institutionName),
  });
}

export function getInventoryExpiryAlerts(req: Request, res: Response): void {
  const actor = getActor(req);
  res.status(200).json({
    status: 'success',
    meta: {
      isDemoData: true,
      persistence: 'PROCESS_MEMORY_ONLY',
      disclaimer:
        'Expiry alerts are calculated from demo inventory; verify stock directly with the facility.',
    },
    data: getExpiryAlerts(actor.institutionName),
  });
}

export function importInventory(req: Request, res: Response): void {
  const actor = getActor(req);
  const payload = req.body as InventoryBatchImportInput;
  const imported = importInventoryBatches(actor, payload.rows);
  res.status(201).json({
    status: 'success',
    meta: {
      isDemoData: true,
      persistedInPostgreSQL: false,
      persistence: 'PROCESS_MEMORY_ONLY',
    },
    message: `Imported ${imported.length} inventory batches into the demo session.`,
    data: imported,
  });
}

export function getNearbyInventoryMatches(req: Request, res: Response): void {
  const query = (
    req as Request & { validatedQuery?: NearbyMatchQueryInput }
  ).validatedQuery;
  if (!query) {
    res.status(400).json({ status: 'error', message: 'A valid location and request are required.' });
    return;
  }
  res.status(200).json({
    status: 'success',
    meta: {
      isDemoData: true,
      disclaimer:
        'Matches use approximate demo coordinates and inventory. Confirm availability, transport and clinical suitability directly with the blood bank.',
    },
    data: findNearbyBloodBankMatches(query),
  });
}

export function createOrganizationOnboarding(req: Request, res: Response): void {
  const payload = req.body as OrganizationOnboardingInput;
  const duplicate = demoInstitutionsStore.some(
    (organization) =>
      organization.licenseRef.toLowerCase() === payload.licenseNumber.toLowerCase() ||
      organization.contactEmail?.toLowerCase() === payload.contactEmail.toLowerCase(),
  );
  if (duplicate) {
    res.status(409).json({
      status: 'error',
      message: 'An organization with this license number or contact email is already registered.',
    });
    return;
  }

  const id = `ORG-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const verificationId = `VER-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const organization = {
    id,
    name: payload.organizationName,
    type: payload.organizationType,
    city: payload.city,
    state: payload.state,
    licenseRef: payload.licenseNumber,
    status: 'UNDER_REVIEW' as const,
    unitsOrBedsLabel:
      payload.organizationType === 'HOSPITAL'
        ? `${payload.bedCapacity} Beds · Pending Verification`
        : `${payload.storageCapacityUnits} Units · Pending Verification`,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    ...(payload.latitude !== undefined && payload.longitude !== undefined
      ? { latitude: payload.latitude, longitude: payload.longitude }
      : {}),
    isDemoData: true as const,
  };
  demoInstitutionsStore.unshift(organization);
  demoVerificationsStore.unshift({
    id: verificationId,
    organizationName: organization.name,
    type: organization.type,
    city: organization.city,
    state: organization.state,
    licenseNumber: organization.licenseRef,
    submittedAt: createdAt,
    status: 'PENDING',
    isDemoData: true,
  });

  appendDemoAuditLog({
    actorName: payload.fullName,
    actorRole: 'PUBLIC',
    institutionName: payload.organizationName,
    action: 'ORGANIZATION_ONBOARDING_SUBMITTED',
    target: verificationId,
    outcome: 'ALLOWED',
    details: `Submitted ${payload.organizationType} onboarding for admin review (demo memory store).`,
  });

  res.status(201).json({
    status: 'success',
    meta: {
      isDemoData: true,
      persistedInPostgreSQL: false,
      verificationStatus: 'PENDING',
    },
    message:
      'Registration received in the demo session and queued for admin verification. No live organization account has been created.',
    data: {
      organizationId: id,
      verificationId,
      status: 'PENDING',
      organization,
    },
  });
}

export function listAuditLogs(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: demoAuditLogsStore,
  });
}

export function listAdminDirectory(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: {
      verifications: demoVerificationsStore,
      institutions: demoInstitutionsStore,
      users: demoUsersStore,
    },
  });
}

export function listAdminConnections(_req: Request, res: Response): void {
  const connections: OrganizationConnectionSummary[] = demoInstitutionsStore.map(
    (organization) => ({
      organizationId: organization.id,
      organizationName: organization.name,
      type: organization.type,
      city: organization.city,
      state: organization.state,
      status: organization.status === 'ACTIVE' ? 'DEMO_ONLY' : 'PENDING',
      lastSyncAt: null,
      isStale: false,
      sourceLabel:
        organization.status === 'ACTIVE'
          ? 'Demo organization record; no external system connection'
          : 'Awaiting admin verification; no connection configured',
      isDemoData: true,
    }),
  );
  const integrations: IntegrationReadiness[] = getIntegrationReadiness();
  res.status(200).json({
    status: 'success',
    meta: {
      isDemoData: true,
      persistence: 'PROCESS_MEMORY_ONLY',
      disclaimer:
        'Demo organizations are not live integrations. A missing sync timestamp means no sync has occurred; it is not reported as stale.',
    },
    data: { connections, integrations },
  });
}

export function reviewAdminVerification(req: Request, res: Response): void {
  const actor = getActor(req);
  const id = req.params.id;
  const payload = req.body as AdminVerificationActionInput;

  const target = demoVerificationsStore.find((item) => item.id === id);
  if (!target) {
    res.status(404).json({ status: 'error', message: 'Verification record not found.' });
    return;
  }

  target.status = payload.status;
  target.reviewNote = payload.reviewNote;
  const organization = demoInstitutionsStore.find(
    (item) => item.licenseRef.toLowerCase() === target.licenseNumber.toLowerCase(),
  );
  if (organization) {
    organization.status =
      payload.status === 'VERIFIED'
        ? 'ACTIVE'
        : payload.status === 'REJECTED'
          ? 'SUSPENDED'
          : 'UNDER_REVIEW';
  }

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: 'ADMIN_VERIFICATION_REVIEW',
    target: target.organizationName,
    outcome: 'ALLOWED',
    details: `Set verification ${target.id} to ${payload.status}. ${payload.reviewNote ?? ''}`.trim(),
  });

  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: target,
  });
}

export function updateAdminInstitutionStatus(req: Request, res: Response): void {
  const actor = getActor(req);
  const id = req.params.id;
  const payload = req.body as AdminEntityStatusInput;

  const target = demoInstitutionsStore.find((item) => item.id === id);
  if (!target) {
    res.status(404).json({ status: 'error', message: 'Institution record not found.' });
    return;
  }

  target.status = payload.status;

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: 'ADMIN_INSTITUTION_STATUS',
    target: target.name,
    outcome: 'ALLOWED',
    details: `Changed ${target.type} status to ${payload.status}. ${payload.reason ?? ''}`.trim(),
  });

  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: target,
  });
}

export function updateAdminUserStatus(req: Request, res: Response): void {
  const actor = getActor(req);
  const id = req.params.id;
  const payload = req.body as AdminEntityStatusInput;

  const target = demoUsersStore.find((item) => item.id === id);
  if (!target) {
    res.status(404).json({ status: 'error', message: 'User record not found.' });
    return;
  }

  target.status = payload.status;

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: 'ADMIN_USER_STATUS',
    target: target.email,
    outcome: 'ALLOWED',
    details: `Changed user ${target.name} status to ${payload.status}. ${payload.reason ?? ''}`.trim(),
  });

  res.status(200).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    data: target,
  });
}
