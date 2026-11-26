import { Router } from 'express';
import {
  AdminEntityStatusSchema,
  AdminVerificationActionSchema,
  AvailabilityQuerySchema,
  BloodStockUpdateSchema,
  DemoRequestValidationSchema,
  RequestStatusUpdateSchema,
} from '../../../shared/schemas/networkSchemas.ts';
import { getHealthStatus } from '../controllers/healthController.ts';
import {
  getBloodAvailability,
  getNetworkSummary,
  validateDemoRequest,
} from '../controllers/networkController.ts';
import {
  createHospitalRequest,
  listAdminDirectory,
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

apiRouter.post(
  '/v1/network/demo-request-check',
  validateRequest({ body: DemoRequestValidationSchema }),
  validateDemoRequest,
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

// Strictly Blood Bank Officer only — Hospital Coordinators and even Admins cannot directly alter bank stock
apiRouter.post(
  '/v1/inventory/update',
  requireRole(['BLOOD_BANK_OFFICER'], 'UPDATE_BLOOD_INVENTORY'),
  validateRequest({ body: BloodStockUpdateSchema }),
  recordBloodStockUpdate,
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
