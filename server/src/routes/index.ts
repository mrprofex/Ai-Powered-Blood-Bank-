import { Router } from 'express';
import {
  AdminEntityStatusSchema,
  AdminVerificationActionSchema,
  AvailabilityQuerySchema,
  BloodStockUpdateSchema,
  DemoRequestValidationSchema,
  InventoryBatchImportSchema,
  NearbyMatchQuerySchema,
  OrganizationOnboardingSchema,
  RequestStatusUpdateSchema,
} from '../../../shared/schemas/networkSchemas.ts';
import { getHealthStatus } from '../controllers/healthController.ts';
import {
  getBloodAvailability,
  getNetworkPredictions,
  getNetworkSummary,
  validateDemoRequest,
} from '../controllers/networkController.ts';
import {
  createHospitalRequest,
  createOrganizationOnboarding,
  getInventoryBatches,
  getInventoryExpiryAlerts,
  getNearbyInventoryMatches,
  importInventory,
  listAdminDirectory,
  listAdminConnections,
  listAuditLogs,
  listHospitalRequests,
  listStockMovements,
  recordBloodStockUpdate,
  reviewAdminVerification,
  updateAdminInstitutionStatus,
  updateAdminUserStatus,
  updateHospitalRequestStatus,
} from '../controllers/operationsController.ts';
import { requireRole } from '../middleware/rbac.ts';
import { validateRequest } from '../middleware/validate.ts';

const apiRouter = Router();

apiRouter.get('/health', getHealthStatus);

apiRouter.get('/v1/network/summary', getNetworkSummary);

apiRouter.get(
  '/v1/network/availability',
  validateRequest({ query: AvailabilityQuerySchema }),
  getBloodAvailability,
);

apiRouter.get(
  '/v1/network/predictions',
  requireRole(
    ['HOSPITAL_COORDINATOR', 'BLOOD_BANK_OFFICER', 'ADMIN'],
    'VIEW_SHORTAGE_PREDICTIONS',
  ),
  getNetworkPredictions,
);

apiRouter.post(
  '/v1/network/demo-request-check',
  validateRequest({ body: DemoRequestValidationSchema }),
  validateDemoRequest,
);

apiRouter.post(
  '/v1/onboarding/organizations',
  validateRequest({ body: OrganizationOnboardingSchema }),
  createOrganizationOnboarding,
);

// Role-Based Operations Endpoints (Server-Side RBAC + Audit Log Enforced)
apiRouter.get(
  '/v1/requests',
  requireRole(['HOSPITAL_COORDINATOR', 'BLOOD_BANK_OFFICER', 'ADMIN'], 'VIEW_REQUESTS'),
  listHospitalRequests,
);

apiRouter.post(
  '/v1/requests',
  requireRole(['HOSPITAL_COORDINATOR', 'ADMIN'], 'CREATE_BLOOD_REQUEST'),
  validateRequest({ body: DemoRequestValidationSchema }),
  createHospitalRequest,
);

apiRouter.patch(
  '/v1/requests/:id/status',
  requireRole(['BLOOD_BANK_OFFICER', 'ADMIN'], 'UPDATE_REQUEST_STATUS'),
  validateRequest({ body: RequestStatusUpdateSchema }),
  updateHospitalRequestStatus,
);

apiRouter.get(
  '/v1/inventory/movements',
  requireRole(['BLOOD_BANK_OFFICER', 'ADMIN'], 'VIEW_INVENTORY_MOVEMENTS'),
  listStockMovements,
);

apiRouter.get(
  '/v1/inventory/batches',
  requireRole(['BLOOD_BANK_OFFICER', 'ADMIN'], 'VIEW_BLOOD_INVENTORY'),
  getInventoryBatches,
);

apiRouter.get(
  '/v1/inventory/alerts',
  requireRole(['BLOOD_BANK_OFFICER', 'ADMIN'], 'VIEW_INVENTORY_EXPIRY_ALERTS'),
  getInventoryExpiryAlerts,
);

apiRouter.post(
  '/v1/inventory/import',
  requireRole(['BLOOD_BANK_OFFICER'], 'IMPORT_BLOOD_INVENTORY'),
  validateRequest({ body: InventoryBatchImportSchema }),
  importInventory,
);

// Strictly Blood Bank Officer only — Hospital Coordinators and even Admins cannot directly alter bank stock
apiRouter.post(
  '/v1/inventory/update',
  requireRole(['BLOOD_BANK_OFFICER'], 'UPDATE_BLOOD_INVENTORY'),
  validateRequest({ body: BloodStockUpdateSchema }),
  recordBloodStockUpdate,
);

apiRouter.get(
  '/v1/matching/nearby',
  requireRole(['HOSPITAL_COORDINATOR', 'ADMIN'], 'MATCH_NEARBY_BLOOD_BANKS'),
  validateRequest({ query: NearbyMatchQuerySchema }),
  getNearbyInventoryMatches,
);

apiRouter.get(
  '/v1/audit-logs',
  requireRole(['ADMIN', 'BLOOD_BANK_OFFICER'], 'VIEW_AUDIT_LOGS'),
  listAuditLogs,
);

apiRouter.get(
  '/v1/admin/directory',
  requireRole(['ADMIN'], 'VIEW_ADMIN_DIRECTORY'),
  listAdminDirectory,
);

apiRouter.get(
  '/v1/admin/connections',
  requireRole(['ADMIN'], 'VIEW_INTEGRATION_CONNECTIONS'),
  listAdminConnections,
);

apiRouter.post(
  '/v1/admin/verifications/:id',
  requireRole(['ADMIN'], 'REVIEW_VERIFICATION'),
  validateRequest({ body: AdminVerificationActionSchema }),
  reviewAdminVerification,
);

apiRouter.patch(
  '/v1/admin/institutions/:id',
  requireRole(['ADMIN'], 'UPDATE_INSTITUTION_STATUS'),
  validateRequest({ body: AdminEntityStatusSchema }),
  updateAdminInstitutionStatus,
);

apiRouter.patch(
  '/v1/admin/users/:id',
  requireRole(['ADMIN'], 'UPDATE_USER_STATUS'),
  validateRequest({ body: AdminEntityStatusSchema }),
  updateAdminUserStatus,
);

export { apiRouter };
