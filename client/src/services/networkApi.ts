import type {
  AdminEntityStatusInput,
  AdminVerificationActionInput,
  AvailabilityQueryInput,
  BloodStockUpdateInput,
  DemoRequestValidationInput,
  InventoryBatchImportInput,
  OrganizationOnboardingInput,
  RequestStatusUpdateInput,
} from '../../../shared/schemas/networkSchemas.ts';
import type {
  BloodInventoryRecord,
  DemoAuditLogEntry,
  DemoHospitalRequestRecord,
  DemoSessionUser,
  DemoStockMovement,
  DemoVerificationRecord,
  HealthCheckResponse,
  BloodInventoryBatchRecord,
  IntegrationReadiness,
  InventoryExpiryAlert,
  NetworkSummaryResponse,
  OrganizationConnectionSummary,
  ShortagePredictionResponse,
} from '../../../shared/types/network.ts';

function buildActorHeaders(user: DemoSessionUser): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Demo-Role': user.role,
    'X-Demo-User': user.name,
    'X-Demo-Institution': user.organizationName,
  };
}

export async function fetchApiHealth(): Promise<HealthCheckResponse> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Health service unavailable');
  }
  return (await response.json()) as HealthCheckResponse;
}

export async function fetchNetworkSummary(): Promise<NetworkSummaryResponse> {
  const response = await fetch('/api/v1/network/summary');
  if (!response.ok) {
    throw new Error('Unable to load network summary');
  }
  const payload = (await response.json()) as {
    status: string;
    data: NetworkSummaryResponse;
  };
  return payload.data;
}

export async function fetchBloodAvailability(
  filters: Partial<AvailabilityQueryInput>,
): Promise<{ records: BloodInventoryRecord[]; disclaimer: string }> {
  const params = new URLSearchParams();
  if (filters.bloodGroup) params.set('bloodGroup', filters.bloodGroup);
  if (filters.component) params.set('component', filters.component);
  if (filters.state) params.set('state', filters.state);
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
  if (filters.search) params.set('search', filters.search);
  if (filters.limit) params.set('limit', String(filters.limit));

  const queryString = params.toString();
  const url = queryString
    ? `/api/v1/network/availability?${queryString}`
    : '/api/v1/network/availability';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to query blood availability records');
  }

  const payload = (await response.json()) as {
    status: string;
    meta: { disclaimer: string };
    data: BloodInventoryRecord[];
  };

  return {
    records: payload.data,
    disclaimer: payload.meta.disclaimer,
  };
}

export async function fetchShortagePredictions(
  user: DemoSessionUser,
): Promise<ShortagePredictionResponse> {
  const response = await fetch('/api/v1/network/predictions', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    message?: string;
    data?: ShortagePredictionResponse;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to load shortage predictions');
  }
  return payload.data;
}

export async function submitOrganizationOnboarding(
  input: OrganizationOnboardingInput,
): Promise<{ organizationId: string; verificationId: string; status: 'PENDING' }> {
  const response = await fetch('/api/v1/onboarding/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    message?: string;
    data?: { organizationId: string; verificationId: string; status: 'PENDING' };
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to submit organization registration');
  }
  return payload.data;
}

export async function checkDemoEmergencyRequest(
  input: DemoRequestValidationInput,
): Promise<{ previewRequestId: string; message: string }> {
  const response = await fetch('/api/v1/network/demo-request-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: { previewRequestId: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Validation check failed');
  }

  return {
    previewRequestId: payload.data.previewRequestId,
    message: payload.message ?? 'Validated in demo mode.',
  };
}

export async function fetchHospitalRequests(
  user: DemoSessionUser,
): Promise<DemoHospitalRequestRecord[]> {
  const response = await fetch('/api/v1/requests', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoHospitalRequestRecord[];
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to load hospital requests');
  }
  return payload.data;
}

export async function createHospitalBloodRequest(
  user: DemoSessionUser,
  input: DemoRequestValidationInput,
): Promise<{ record: DemoHospitalRequestRecord; message: string }> {
  const response = await fetch('/api/v1/requests', {
    method: 'POST',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoHospitalRequestRecord;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to create blood request');
  }
  return {
    record: payload.data,
    message: payload.message ?? 'Request created in demo session.',
  };
}

export async function updateHospitalRequestStatusApi(
  user: DemoSessionUser,
  requestId: string,
  input: RequestStatusUpdateInput,
): Promise<DemoHospitalRequestRecord> {
  const response = await fetch(`/api/v1/requests/${encodeURIComponent(requestId)}/status`, {
    method: 'PATCH',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoHospitalRequestRecord;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to update request status');
  }
  return payload.data;
}

export async function fetchStockMovements(
  user: DemoSessionUser,
): Promise<DemoStockMovement[]> {
  const response = await fetch('/api/v1/inventory/movements', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoStockMovement[];
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to fetch stock movements');
  }
  return payload.data;
}

export async function submitBloodStockUpdate(
  user: DemoSessionUser,
  input: BloodStockUpdateInput,
): Promise<{ movement: DemoStockMovement; message: string }> {
  const response = await fetch('/api/v1/inventory/update', {
    method: 'POST',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoStockMovement;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Inventory update denied or invalid');
  }
  return {
    movement: payload.data,
    message: payload.message ?? 'Stock update recorded.',
  };
}

export async function fetchInventoryBatches(
  user: DemoSessionUser,
): Promise<BloodInventoryBatchRecord[]> {
  const response = await fetch('/api/v1/inventory/batches', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    message?: string;
    data?: BloodInventoryBatchRecord[];
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to load inventory batches');
  }
  return payload.data;
}

export async function importInventoryBatchesApi(
  user: DemoSessionUser,
  input: InventoryBatchImportInput,
): Promise<BloodInventoryBatchRecord[]> {
  const response = await fetch('/api/v1/inventory/import', {
    method: 'POST',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    message?: string;
    data?: BloodInventoryBatchRecord[];
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to import inventory batches');
  }
  return payload.data;
}

export async function fetchInventoryExpiryAlerts(
  user: DemoSessionUser,
): Promise<InventoryExpiryAlert[]> {
  const response = await fetch('/api/v1/inventory/alerts', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    message?: string;
    data?: InventoryExpiryAlert[];
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to load inventory expiry alerts');
  }
  return payload.data;
}

export async function fetchAuditLogsApi(
  user: DemoSessionUser,
): Promise<DemoAuditLogEntry[]> {
  const response = await fetch('/api/v1/audit-logs', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoAuditLogEntry[];
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to fetch audit logs');
  }
  return payload.data;
}

export interface AdminDirectoryResponse {
  verifications: DemoVerificationRecord[];
  institutions: Array<{
    id: string;
    name: string;
    type: 'HOSPITAL' | 'BLOOD_BANK';
    city: string;
    state: string;
    licenseRef: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
    unitsOrBedsLabel: string;
    isDemoData: true;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: DemoSessionUser['role'];
    institution: string;
    city: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
    isDemoData: true;
  }>;
}

export interface AdminConnectionsResponse {
  connections: OrganizationConnectionSummary[];
  integrations: IntegrationReadiness[];
}

export async function fetchAdminConnectionsApi(
  user: DemoSessionUser,
): Promise<AdminConnectionsResponse> {
  const response = await fetch('/api/v1/admin/connections', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    message?: string;
    data?: AdminConnectionsResponse;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to load integration connections');
  }
  return payload.data;
}

export async function fetchAdminDirectoryApi(
  user: DemoSessionUser,
): Promise<AdminDirectoryResponse> {
  const response = await fetch('/api/v1/admin/directory', {
    headers: buildActorHeaders(user),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: AdminDirectoryResponse;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to load admin directory');
  }
  return payload.data;
}

export async function reviewAdminVerificationApi(
  user: DemoSessionUser,
  id: string,
  input: AdminVerificationActionInput,
): Promise<DemoVerificationRecord> {
  const response = await fetch(`/api/v1/admin/verifications/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    status: string;
    message?: string;
    data?: DemoVerificationRecord;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? 'Unable to submit verification review');
  }
  return payload.data;
}

export async function updateAdminInstitutionStatusApi(
  user: DemoSessionUser,
  id: string,
  input: AdminEntityStatusInput,
): Promise<void> {
  const response = await fetch(`/api/v1/admin/institutions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const payload = (await response.json()) as { message?: string };
    throw new Error(payload.message ?? 'Unable to update institution status');
  }
}

export async function updateAdminUserStatusApi(
  user: DemoSessionUser,
  id: string,
  input: AdminEntityStatusInput,
): Promise<void> {
  const response = await fetch(`/api/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: buildActorHeaders(user),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const payload = (await response.json()) as { message?: string };
    throw new Error(payload.message ?? 'Unable to update user status');
  }
}
