import type { Request, Response } from 'express';
import type {
  AdminEntityStatusInput,
  AdminVerificationActionInput,
  BloodStockUpdateInput,
  DemoRequestValidationInput,
  RequestStatusUpdateInput,
} from '../../../shared/schemas/networkSchemas.ts';
import type { DemoHospitalRequestRecord, DemoStockMovement } from '../../../shared/types/network.ts';
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

  const newRequest: DemoHospitalRequestRecord = {
    id: `REQ-DEMO-${Date.now().toString().slice(-4)}`,
    department: payload.department,
    hospitalName: payload.hospitalName,
    city: payload.city,
    bloodGroup: payload.bloodGroup,
    component: payload.component,
    units: payload.unitsNeeded,
    urgency: payload.urgency,
    status: 'OPEN',
    matchedBank: 'Pending Blood Bank Matching',
    etaMinutes: payload.urgency === 'CRITICAL' ? 25 : payload.urgency === 'HIGH' ? 40 : 65,
    createdAt: new Date().toISOString(),
    createdBy: actor.userName,
    notes: payload.notes,
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
    details: `Created ${payload.urgency} demo request for ${payload.unitsNeeded}u ${payload.bloodGroup} ${payload.component} in ${payload.city}.`,
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

  const latestSameBatch = demoStockMovementsStore.find(
    (m) => m.batchCode === payload.batchCode,
  );
  const prevUnits = latestSameBatch ? latestSameBatch.resultingUnits : 40;
  const deltaSigned = payload.movementType === 'DISPATCH_OUT' ? -payload.unitsDelta : payload.unitsDelta;
  const resultingUnits =
    payload.movementType === 'UPDATE_STOCK'
      ? payload.unitsDelta
      : Math.max(0, prevUnits + deltaSigned);

  const movement: DemoStockMovement = {
    id: `MOV-DEMO-${Date.now().toString().slice(-4)}`,
    batchCode: payload.batchCode,
    bloodGroup: payload.bloodGroup,
    component: payload.component,
    movementType: payload.movementType,
    unitsDelta: payload.unitsDelta,
    resultingUnits,
    storageUnit: payload.storageUnit,
    expiryDate: payload.expiryDate,
    counterparty: payload.counterparty,
    notes: payload.notes,
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    timestamp: new Date().toISOString(),
    isDemoData: true,
  };

  demoStockMovementsStore.unshift(movement);

  appendDemoAuditLog({
    actorName: actor.userName,
    actorRole: actor.role,
    institutionName: actor.institutionName,
    action: `INVENTORY_${payload.movementType}`,
    target: payload.batchCode,
    outcome: 'ALLOWED',
    details: `${payload.movementType} (${payload.unitsDelta}u ${payload.bloodGroup} ${payload.component}) -> resulting ${resultingUnits}u. Notes: ${payload.notes ?? 'None'}`,
  });

  res.status(201).json({
    status: 'success',
    meta: { isDemoData: true, persistedInPostgreSQL: false },
    message: 'Inventory movement recorded with immutable audit entry (demo session).',
    data: movement,
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
