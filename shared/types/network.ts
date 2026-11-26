import type {
  BloodComponent,
  BloodGroup,
  DataSourceStatus,
  NotificationCategory,
  RiskLevel,
  StockMovementType,
  UserRole,
} from '../constants/bloodNetwork.ts';

export interface HealthCheckResponse {
  status: 'ok';
  service: string;
  phase: string;
  environment: string;
  timestamp: string;
  database: {
    provider: 'neon-postgresql';
    orm: 'prisma';
    configured: boolean;
    mode: 'configuration-only';
  };
  integrations: {
    geminiConfigured: boolean;
    googleOAuthConfigured: boolean;
    eraktkoshConfigured: boolean;
  };
}

export interface BloodGroupSummaryItem {
  bloodGroup: BloodGroup;
  availableUnits: number;
  minimumThreshold: number;
  daysOfCover: number;
  riskLevel: RiskLevel;
}

export interface RegionalRiskItem {
  region: string;
  state: string;
  hospitalsCount: number;
  bloodBanksCount: number;
  totalUnits: number;
  criticalGroups: BloodGroup[];
  riskLevel: RiskLevel;
  riskScore: number;
}

export interface BloodInventoryRecord {
  id: string;
  facilityName: string;
  facilityType: 'BLOOD_BANK' | 'HOSPITAL_BLOOD_CENTER';
  city: string;
  state: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  expiringWithin72h: number;
  daysOfCover: number;
  riskLevel: RiskLevel;
  sourceStatus: DataSourceStatus;
  sourceLabel: string;
  lastUpdatedAt: string;
  contactPhone: string;
  isDemoData: true;
}

export interface DemoActivityItem {
  id: string;
  title: string;
  facility: string;
  city: string;
  bloodGroup: BloodGroup;
  units: number;
  category: 'SHORTAGE_ALERT' | 'TRANSFER_MATCH' | 'INVENTORY_LOG' | 'EXPIRY_NOTICE';
  timestamp: string;
  isDemoData: true;
}

export interface NetworkSummaryResponse {
  isDemoData: true;
  disclaimer: string;
  kpis: {
    registeredHospitals: number;
    registeredBloodBanks: number;
    availableBloodUnits: number;
    activeEmergencyRequests: number;
  };
  bloodGroupOverview: BloodGroupSummaryItem[];
  regionalRiskOverview: RegionalRiskItem[];
  recentActivity: DemoActivityItem[];
}

export interface DemoSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationName: string;
  city: string;
  isDemoMode: true;
}

export interface DemoStockMovement {
  id: string;
  batchCode: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  movementType: StockMovementType;
  unitsDelta: number;
  resultingUnits: number;
  storageUnit: string;
  expiryDate: string;
  counterparty?: string;
  notes?: string;
  actorName: string;
  actorRole: UserRole;
  institutionName: string;
  timestamp: string;
  isDemoData: true;
}

export interface DemoAuditLogEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  institutionName: string;
  action: string;
  target: string;
  outcome: 'ALLOWED' | 'DENIED';
  details: string;
  timestamp: string;
  isDemoData: true;
}

export interface DemoHospitalRequestRecord {
  id: string;
  department: string;
  hospitalName: string;
  city: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  units: number;
  urgency: 'CRITICAL' | 'HIGH' | 'ROUTINE';
  status: 'MATCHED' | 'OPEN' | 'ALLOCATED' | 'DISPATCHED';
  matchedBank: string;
  etaMinutes: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
  isDemoData: true;
}

export interface DemoVerificationRecord {
  id: string;
  organizationName: string;
  type: 'HOSPITAL' | 'BLOOD_BANK';
  city: string;
  state: string;
  licenseNumber: string;
  submittedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  reviewNote?: string;
  isDemoData: true;
}

export interface DemoNotificationRecord {
  id: string;
  title: string;
  detail: string;
  category: NotificationCategory;
  severity: RiskLevel;
  timestamp: string;
  facility: string;
  targetRoles: UserRole[];
  unread: boolean;
  isDemoData: true;
}
