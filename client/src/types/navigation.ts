import type { UserRole } from '../../../shared/constants/bloodNetwork.ts';

export type AppPage =
  | 'landing'
  | 'login'
  | 'signup'
  // Legacy / alias route resolved to active role dashboard
  | 'dashboard'
  // Public Searcher Workspace
  | 'public-dashboard'
  | 'availability'
  | 'public-group-search'
  | 'public-nearby-banks'
  | 'public-emergency-info'
  // Hospital Coordinator Workspace
  | 'hospital'
  | 'hospital-create-request'
  | 'requests'
  | 'hospital-request-tracking'
  | 'predictions-7d'
  | 'predictions-30d'
  | 'shortage-alerts'
  // Blood Bank Officer Workspace
  | 'blood-bank'
  | 'bank-inventory-overview'
  | 'bank-update-stock'
  | 'bank-group-inventory'
  | 'bank-expiry-management'
  | 'bank-records'
  // Network Admin Workspace
  | 'admin'
  | 'admin-hospitals'
  | 'admin-blood-banks'
  | 'predictions'
  | 'admin-verification'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-audit-logs'
  | 'admin-system'
  // Shared role-scoped subpages
  | 'notifications'
  | 'reports'
  | 'settings';

export type NavIconKey =
  | 'dashboard'
  | 'availability'
  | 'group-search'
  | 'nearby-banks'
  | 'emergency'
  | 'create-request'
  | 'tracking'
  | 'prediction-7d'
  | 'prediction-30d'
  | 'shortage'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'inventory'
  | 'update-stock'
  | 'expiry'
  | 'records'
  | 'hospitals'
  | 'blood-banks'
  | 'verification'
  | 'users'
  | 'roles'
  | 'audit';

export interface RoleNavItem {
  id: AppPage;
  label: string;
  breadcrumb: string;
  section: string;
  icon: NavIconKey;
}

export const ROLE_NAV_ITEMS: Record<UserRole, RoleNavItem[]> = {
  PUBLIC: [
    { id: 'public-dashboard', label: 'Public Dashboard', breadcrumb: 'Public Dashboard', section: 'Public Discovery', icon: 'dashboard' },
    { id: 'availability', label: 'Blood Availability', breadcrumb: 'Blood Availability', section: 'Public Discovery', icon: 'availability' },
    { id: 'public-group-search', label: 'Blood Group Search', breadcrumb: 'Blood Group Search', section: 'Public Discovery', icon: 'group-search' },
    { id: 'public-nearby-banks', label: 'Nearby Blood Banks', breadcrumb: 'Nearby Blood Banks', section: 'Public Discovery', icon: 'nearby-banks' },
    { id: 'public-emergency-info', label: 'Emergency Information', breadcrumb: 'Emergency Information', section: 'Support', icon: 'emergency' },
    { id: 'notifications', label: 'Notifications', breadcrumb: 'Public Advisories', section: 'Support', icon: 'notifications' },
  ],
  HOSPITAL_COORDINATOR: [
    { id: 'hospital', label: 'Hospital Dashboard', breadcrumb: 'Hospital Dashboard', section: 'Overview', icon: 'dashboard' },
    { id: 'availability', label: 'Blood Availability', breadcrumb: 'Blood Availability', section: 'Overview', icon: 'availability' },
    { id: 'hospital-create-request', label: 'Create Blood Request', breadcrumb: 'Create Blood Request', section: 'Requests', icon: 'create-request' },
    { id: 'requests', label: 'Emergency Requests', breadcrumb: 'Emergency Requests', section: 'Requests', icon: 'emergency' },
    { id: 'hospital-request-tracking', label: 'Request Tracking', breadcrumb: 'Request Tracking', section: 'Requests', icon: 'tracking' },
    { id: 'predictions-7d', label: '7-Day Demand Prediction', breadcrumb: '7-Day Demand Forecast', section: 'Forecasting', icon: 'prediction-7d' },
    { id: 'predictions-30d', label: '30-Day Demand Prediction', breadcrumb: '30-Day Demand Forecast', section: 'Forecasting', icon: 'prediction-30d' },
    { id: 'shortage-alerts', label: 'Shortage Alerts', breadcrumb: 'Shortage Alerts', section: 'Alerts & Admin', icon: 'shortage' },
    { id: 'notifications', label: 'Notifications', breadcrumb: 'Notifications', section: 'Alerts & Admin', icon: 'notifications' },
    { id: 'reports', label: 'Reports', breadcrumb: 'Hospital Reports', section: 'Alerts & Admin', icon: 'reports' },
    { id: 'settings', label: 'Settings', breadcrumb: 'Hospital Settings', section: 'Alerts & Admin', icon: 'settings' },
  ],
  BLOOD_BANK_OFFICER: [
    { id: 'blood-bank', label: 'Blood Bank Dashboard', breadcrumb: 'Blood Bank Dashboard', section: 'Overview', icon: 'dashboard' },
    { id: 'bank-inventory-overview', label: 'Inventory Overview', breadcrumb: 'Inventory Overview', section: 'Inventory', icon: 'inventory' },
    { id: 'bank-update-stock', label: 'Update Stock', breadcrumb: 'Stock Management', section: 'Inventory', icon: 'update-stock' },
    { id: 'bank-group-inventory', label: 'Blood Group Inventory', breadcrumb: 'Blood Group Inventory', section: 'Inventory', icon: 'group-search' },
    { id: 'bank-expiry-management', label: 'Expiry Management', breadcrumb: 'Expiry Management', section: 'Inventory', icon: 'expiry' },
    { id: 'requests', label: 'Hospital Requests', breadcrumb: 'Hospital Requests', section: 'Operations', icon: 'emergency' },
    { id: 'predictions-7d', label: '7-Day Stock Prediction', breadcrumb: '7-Day Stock Forecast', section: 'Forecasting', icon: 'prediction-7d' },
    { id: 'predictions-30d', label: '30-Day Stock Prediction', breadcrumb: '30-Day Stock Forecast', section: 'Forecasting', icon: 'prediction-30d' },
    { id: 'shortage-alerts', label: 'Low Stock Alerts', breadcrumb: 'Low Stock Alerts', section: 'Records & Alerts', icon: 'shortage' },
    { id: 'notifications', label: 'Notifications', breadcrumb: 'Notifications', section: 'Records & Alerts', icon: 'notifications' },
    { id: 'bank-records', label: 'Donation & Dispatch Records', breadcrumb: 'Donation & Dispatch Records', section: 'Records & Alerts', icon: 'records' },
    { id: 'reports', label: 'Reports', breadcrumb: 'Blood Bank Reports', section: 'Records & Alerts', icon: 'reports' },
    { id: 'settings', label: 'Settings', breadcrumb: 'Blood Bank Settings', section: 'Records & Alerts', icon: 'settings' },
  ],
  ADMIN: [
    { id: 'admin', label: 'Network Overview', breadcrumb: 'Network Overview', section: 'Command', icon: 'dashboard' },
    { id: 'availability', label: 'Blood Availability', breadcrumb: 'Network Blood Availability', section: 'Command', icon: 'availability' },
    { id: 'admin-hospitals', label: 'Hospital Management', breadcrumb: 'Hospital Management', section: 'Institutions', icon: 'hospitals' },
    { id: 'admin-blood-banks', label: 'Blood Bank Management', breadcrumb: 'Blood Bank Management', section: 'Institutions', icon: 'blood-banks' },
    { id: 'requests', label: 'Emergency Requests', breadcrumb: 'Emergency Requests', section: 'Monitoring', icon: 'emergency' },
    { id: 'predictions', label: 'AI Predictions', breadcrumb: 'Network AI Predictions', section: 'Monitoring', icon: 'prediction-7d' },
    { id: 'shortage-alerts', label: 'Shortage Monitoring', breadcrumb: 'Shortage Monitoring', section: 'Monitoring', icon: 'shortage' },
    { id: 'notifications', label: 'Notifications', breadcrumb: 'Network Notifications', section: 'Monitoring', icon: 'notifications' },
    { id: 'admin-verification', label: 'Institutional Verification', breadcrumb: 'Institutional Verification', section: 'Governance', icon: 'verification' },
    { id: 'admin-users', label: 'User Management', breadcrumb: 'User Management', section: 'Governance', icon: 'users' },
    { id: 'admin-roles', label: 'Role & Permissions', breadcrumb: 'Role & Permission Management', section: 'Governance', icon: 'roles' },
    { id: 'reports', label: 'Analytics & Reports', breadcrumb: 'Analytics & Reports', section: 'System', icon: 'reports' },
    { id: 'admin-audit-logs', label: 'Audit Logs', breadcrumb: 'Audit Logs', section: 'System', icon: 'audit' },
    { id: 'admin-system', label: 'System Configuration', breadcrumb: 'System Configuration', section: 'System', icon: 'settings' },
    { id: 'settings', label: 'Platform Settings', breadcrumb: 'Platform Settings', section: 'System', icon: 'settings' },
  ],
};

export function getDefaultPageForRole(role: UserRole): AppPage {
  switch (role) {
    case 'PUBLIC':
      return 'public-dashboard';
    case 'HOSPITAL_COORDINATOR':
      return 'hospital';
    case 'BLOOD_BANK_OFFICER':
      return 'blood-bank';
    case 'ADMIN':
      return 'admin';
  }
}

export function isPageAllowedForRole(role: UserRole, page: AppPage): boolean {
  if (page === 'landing' || page === 'login' || page === 'signup' || page === 'dashboard') {
    return true;
  }
  return ROLE_NAV_ITEMS[role].some((item) => item.id === page);
}

export function getNavItemMeta(role: UserRole, page: AppPage): RoleNavItem {
  const found = ROLE_NAV_ITEMS[role].find((item) => item.id === page);
  if (found) return found;
  return ROLE_NAV_ITEMS[role][0];
}
