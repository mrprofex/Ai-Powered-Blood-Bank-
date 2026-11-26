import assert from 'node:assert/strict';
import { hasRolePermission } from '../shared/constants/bloodNetwork.ts';
import {
  AdminVerificationActionSchema,
  AvailabilityQuerySchema,
  BloodStockUpdateSchema,
  DemoLoginInputSchema,
  DemoRequestValidationSchema,
  DemoSignupInputSchema,
  RequestStatusUpdateSchema,
} from '../shared/schemas/networkSchemas.ts';
import {
  DEMO_BLOOD_INVENTORY,
  DEMO_NETWORK_SUMMARY,
} from '../server/src/data/demoNetworkData.ts';
import { isPageAllowedForRole } from '../client/src/types/navigation.ts';

function runPhase1Tests(): void {
  // 1. Validate query schema defaults & bounds
  const validQuery = AvailabilityQuerySchema.parse({
    bloodGroup: 'O-',
    component: 'PRBC',
    limit: '10',
  });
  assert.equal(validQuery.bloodGroup, 'O-');
  assert.equal(validQuery.limit, 10);

  // 2. Reject invalid blood group
  const badQuery = AvailabilityQuerySchema.safeParse({ bloodGroup: 'Z+' });
  assert.equal(badQuery.success, false);

  // 3. Validate demo login & signup schemas
  const validLogin = DemoLoginInputSchema.safeParse({
    email: 'coordinator@hospital-demo.in',
    password: 'demo-password-123',
    role: 'HOSPITAL_COORDINATOR',
  });
  assert.equal(validLogin.success, true);

  const validSignup = DemoSignupInputSchema.safeParse({
    fullName: 'Dr. Priya Sharma',
    organizationName: 'Metro Trauma Hospital (Demo)',
    email: 'priya@hospital-demo.in',
    city: 'Bengaluru',
    state: 'Karnataka',
    role: 'HOSPITAL_COORDINATOR',
  });
  assert.equal(validSignup.success, true);

  // 4. Reject out-of-range emergency unit request
  const badRequest = DemoRequestValidationSchema.safeParse({
    hospitalName: 'Demo Hospital',
    bloodGroup: 'O-',
    component: 'PRBC',
    unitsNeeded: 500,
    urgency: 'CRITICAL',
    city: 'Mumbai',
  });
  assert.equal(badRequest.success, false);

  // 5. Verify all demo records explicitly carry isDemoData = true
  assert.equal(DEMO_NETWORK_SUMMARY.isDemoData, true);
  for (const item of DEMO_BLOOD_INVENTORY) {
    assert.equal(item.isDemoData, true);
    assert.equal(item.sourceStatus, 'DEMO');
  }

  // 6. Validate stock update, request status, and admin verification schemas
  const validStockUpdate = BloodStockUpdateSchema.safeParse({
    batchCode: 'BATCH-TEST-01',
    bloodGroup: 'O+',
    component: 'PRBC',
    movementType: 'ADD_UNITS',
    unitsDelta: 12,
    storageUnit: 'Cold Vault A-01',
    expiryDate: '2026-12-20',
  });
  assert.equal(validStockUpdate.success, true);

  const validStatusUpdate = RequestStatusUpdateSchema.safeParse({
    status: 'ALLOCATED',
    matchedBank: 'KEM Regional Blood Center (Demo)',
  });
  assert.equal(validStatusUpdate.success, true);

  const validVerification = AdminVerificationActionSchema.safeParse({
    status: 'VERIFIED',
    reviewNote: 'SBTC documents validated',
  });
  assert.equal(validVerification.success, true);

  // 7. Enforce strict RBAC permission separation & UI route isolation
  assert.equal(hasRolePermission('BLOOD_BANK_OFFICER', 'MANAGE_BLOOD_BANK_INVENTORY'), true);
  assert.equal(hasRolePermission('HOSPITAL_COORDINATOR', 'MANAGE_BLOOD_BANK_INVENTORY'), false);
  assert.equal(hasRolePermission('ADMIN', 'MANAGE_BLOOD_BANK_INVENTORY'), false);
  assert.equal(hasRolePermission('PUBLIC', 'CREATE_BLOOD_REQUEST'), false);

  assert.equal(isPageAllowedForRole('PUBLIC', 'bank-update-stock'), false);
  assert.equal(isPageAllowedForRole('HOSPITAL_COORDINATOR', 'admin-audit-logs'), false);
  assert.equal(isPageAllowedForRole('BLOOD_BANK_OFFICER', 'hospital-create-request'), false);
  assert.equal(isPageAllowedForRole('ADMIN', 'admin-audit-logs'), true);

  console.log('Phase 1 validation, provenance & RBAC checks passed (7/7).');
}

runPhase1Tests();
