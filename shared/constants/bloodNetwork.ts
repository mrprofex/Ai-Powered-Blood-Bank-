export const BLOOD_GROUPS = [
  'O+',
  'O-',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const BLOOD_COMPONENTS = [
  'WHOLE_BLOOD',
  'PRBC',
  'PLATELETS',
  'FFP',
  'CRYO',
] as const;

export type BloodComponent = (typeof BLOOD_COMPONENTS)[number];

export const BLOOD_COMPONENT_LABELS: Record<BloodComponent, string> = {
  WHOLE_BLOOD: 'Whole Blood',
  PRBC: 'Packed RBC (PRBC)',
  PLATELETS: 'Platelets (RDP/SDP)',
  FFP: 'Fresh Frozen Plasma',
  CRYO: 'Cryoprecipitate',
};

export const RISK_LEVELS = ['LOW', 'MODERATE', 'CRITICAL'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const DATA_SOURCE_BADGES = ['DEMO', 'VERIFIED', 'STALE'] as const;
export type DataSourceStatus = (typeof DATA_SOURCE_BADGES)[number];

export const USER_ROLES = [
  'PUBLIC',
  'HOSPITAL_COORDINATOR',
  'BLOOD_BANK_OFFICER',
  'ADMIN',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  PUBLIC: 'Public Searcher',
  HOSPITAL_COORDINATOR: 'Hospital Coordinator',
  BLOOD_BANK_OFFICER: 'Blood Bank Officer',
  ADMIN: 'Network Admin',
};

export const NOTIFICATION_CATEGORIES = [
  'CRITICAL_SHORTAGE',
  'LOW_STOCK',
  'EMERGENCY_REQUEST',
  'INVENTORY_UPDATE',
  'EXPIRING_UNITS',
  'NEW_HOSPITAL_REQUEST',
  'REQUEST_STATUS_CHANGE',
  'INSTITUTIONAL_VERIFICATION',
  'SYSTEM_NOTIFICATION',
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  CRITICAL_SHORTAGE: 'Critical Shortage',
  LOW_STOCK: 'Low Stock',
  EMERGENCY_REQUEST: 'Emergency Request',
  INVENTORY_UPDATE: 'Inventory Update',
  EXPIRING_UNITS: 'Expiring Blood Units',
  NEW_HOSPITAL_REQUEST: 'New Hospital Request',
  REQUEST_STATUS_CHANGE: 'Request Status Change',
  INSTITUTIONAL_VERIFICATION: 'Institutional Verification',
  SYSTEM_NOTIFICATION: 'System Notification',
};

export const STOCK_MOVEMENT_TYPES = [
  'ADD_UNITS',
  'UPDATE_STOCK',
  'DONATION_IN',
  'DISPATCH_OUT',
  'EXPIRY_FLAG',
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export type PermissionAction =
  | 'VIEW_PUBLIC_AVAILABILITY'
  | 'CREATE_BLOOD_REQUEST'
  | 'TRACK_HOSPITAL_REQUESTS'
  | 'VIEW_HOSPITAL_PREDICTIONS'
  | 'MANAGE_BLOOD_BANK_INVENTORY'
  | 'RECORD_DONATIONS_AND_DISPATCHES'
  | 'RESPOND_TO_HOSPITAL_REQUESTS'
  | 'VIEW_BANK_PREDICTIONS'
  | 'VERIFY_INSTITUTIONS'
  | 'MANAGE_USERS_AND_ROLES'
  | 'VIEW_AUDIT_LOGS'
  | 'CONFIGURE_PLATFORM';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  PUBLIC: ['VIEW_PUBLIC_AVAILABILITY'],
  HOSPITAL_COORDINATOR: [
    'VIEW_PUBLIC_AVAILABILITY',
    'CREATE_BLOOD_REQUEST',
    'TRACK_HOSPITAL_REQUESTS',
    'VIEW_HOSPITAL_PREDICTIONS',
  ],
  BLOOD_BANK_OFFICER: [
    'VIEW_PUBLIC_AVAILABILITY',
    'MANAGE_BLOOD_BANK_INVENTORY',
    'RECORD_DONATIONS_AND_DISPATCHES',
    'RESPOND_TO_HOSPITAL_REQUESTS',
    'VIEW_BANK_PREDICTIONS',
  ],
  ADMIN: [
    'VIEW_PUBLIC_AVAILABILITY',
    'CREATE_BLOOD_REQUEST',
    'TRACK_HOSPITAL_REQUESTS',
    'VIEW_HOSPITAL_PREDICTIONS',
    'RESPOND_TO_HOSPITAL_REQUESTS',
    'VIEW_BANK_PREDICTIONS',
    'VERIFY_INSTITUTIONS',
    'MANAGE_USERS_AND_ROLES',
    'VIEW_AUDIT_LOGS',
    'CONFIGURE_PLATFORM',
  ],
};

export function hasRolePermission(role: UserRole, permission: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export const INDIAN_STATES_DEMO = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Tamil Nadu',
  'Telangana',
  'West Bengal',
  'Gujarat',
  'Kerala',
] as const;
