import { describe, it, expect } from 'vitest';
import {
  BLOOD_GROUPS,
  BLOOD_COMPONENTS,
  RISK_LEVELS,
  USER_ROLES,
  STOCK_MOVEMENT_TYPES,
  NOTIFICATION_CATEGORIES,
  ROLE_PERMISSIONS,
  hasRolePermission,
  BLOOD_COMPONENT_LABELS,
  ROLE_DISPLAY_NAMES,
  INDIAN_STATES_DEMO,
} from '../../shared/constants/bloodNetwork.ts';

describe('Shared Constants', () => {
  describe('Blood Groups', () => {
    it('has exactly 8 blood groups', () => {
      expect(BLOOD_GROUPS).toHaveLength(8);
    });

    it('contains all standard ABO/Rh groups', () => {
      expect(BLOOD_GROUPS).toContain('O+');
      expect(BLOOD_GROUPS).toContain('O-');
      expect(BLOOD_GROUPS).toContain('A+');
      expect(BLOOD_GROUPS).toContain('A-');
      expect(BLOOD_GROUPS).toContain('B+');
      expect(BLOOD_GROUPS).toContain('B-');
      expect(BLOOD_GROUPS).toContain('AB+');
      expect(BLOOD_GROUPS).toContain('AB-');
    });

    it('is readonly tuple', () => {
      expect(BLOOD_GROUPS).toBeInstanceOf(Array);
    });
  });

  describe('Blood Components', () => {
    it('has all 5 components', () => {
      expect(BLOOD_COMPONENTS).toHaveLength(5);
    });

    it('contains all standard components', () => {
      expect(BLOOD_COMPONENTS).toContain('WHOLE_BLOOD');
      expect(BLOOD_COMPONENTS).toContain('PRBC');
      expect(BLOOD_COMPONENTS).toContain('PLATELETS');
      expect(BLOOD_COMPONENTS).toContain('FFP');
      expect(BLOOD_COMPONENTS).toContain('CRYO');
    });
  });

  describe('Risk Levels', () => {
    it('has 3 risk levels in correct order', () => {
      expect(RISK_LEVELS).toEqual(['LOW', 'MODERATE', 'CRITICAL']);
    });
  });

  describe('User Roles', () => {
    it('has 4 roles', () => {
      expect(USER_ROLES).toHaveLength(4);
    });

    it('contains all roles', () => {
      expect(USER_ROLES).toContain('PUBLIC');
      expect(USER_ROLES).toContain('HOSPITAL_COORDINATOR');
      expect(USER_ROLES).toContain('BLOOD_BANK_OFFICER');
      expect(USER_ROLES).toContain('ADMIN');
    });
  });

  describe('Stock Movement Types', () => {
    it('has 6 movement types', () => {
      expect(STOCK_MOVEMENT_TYPES).toHaveLength(6);
    });

    it('contains all movement types', () => {
      expect(STOCK_MOVEMENT_TYPES).toContain('ADD_UNITS');
      expect(STOCK_MOVEMENT_TYPES).toContain('UPDATE_STOCK');
      expect(STOCK_MOVEMENT_TYPES).toContain('DONATION_IN');
      expect(STOCK_MOVEMENT_TYPES).toContain('DISPATCH_OUT');
      expect(STOCK_MOVEMENT_TYPES).toContain('EXPIRY_FLAG');
    });
  });

  describe('Notification Categories', () => {
    it('has 10 notification categories', () => {
      expect(NOTIFICATION_CATEGORIES).toHaveLength(10);
    });
  });

  describe('Role Permissions', () => {
    it('PUBLIC has only VIEW_PUBLIC_AVAILABILITY', () => {
      expect(ROLE_PERMISSIONS.PUBLIC).toEqual(['VIEW_PUBLIC_AVAILABILITY']);
    });

    it('HOSPITAL_COORDINATOR has 4 permissions', () => {
      expect(ROLE_PERMISSIONS.HOSPITAL_COORDINATOR).toHaveLength(4);
      expect(ROLE_PERMISSIONS.HOSPITAL_COORDINATOR).toContain('CREATE_BLOOD_REQUEST');
      expect(ROLE_PERMISSIONS.HOSPITAL_COORDINATOR).toContain('TRACK_HOSPITAL_REQUESTS');
      expect(ROLE_PERMISSIONS.HOSPITAL_COORDINATOR).toContain('VIEW_HOSPITAL_PREDICTIONS');
      expect(ROLE_PERMISSIONS.HOSPITAL_COORDINATOR).toContain('VIEW_PUBLIC_AVAILABILITY');
    });

    it('BLOOD_BANK_OFFICER has 5 permissions', () => {
      expect(ROLE_PERMISSIONS.BLOOD_BANK_OFFICER).toHaveLength(5);
      expect(ROLE_PERMISSIONS.BLOOD_BANK_OFFICER).toContain('MANAGE_BLOOD_BANK_INVENTORY');
      expect(ROLE_PERMISSIONS.BLOOD_BANK_OFFICER).toContain('RESPOND_TO_HOSPITAL_REQUESTS');
    });

    it('ADMIN has all 12 permissions', () => {
      expect(ROLE_PERMISSIONS.ADMIN).toHaveLength(12);
      expect(ROLE_PERMISSIONS.ADMIN).toContain('VERIFY_INSTITUTIONS');
      expect(ROLE_PERMISSIONS.ADMIN).toContain('MANAGE_USERS_AND_ROLES');
      expect(ROLE_PERMISSIONS.ADMIN).toContain('VIEW_AUDIT_LOGS');
      expect(ROLE_PERMISSIONS.ADMIN).toContain('CONFIGURE_PLATFORM');
    });
  });

  describe('hasRolePermission', () => {
    it('returns true for allowed permission', () => {
      expect(hasRolePermission('HOSPITAL_COORDINATOR', 'CREATE_BLOOD_REQUEST')).toBe(true);
    });

    it('returns false for disallowed permission', () => {
      expect(hasRolePermission('HOSPITAL_COORDINATOR', 'MANAGE_BLOOD_BANK_INVENTORY')).toBe(false);
    });

    it('returns true for ADMIN with any permission', () => {
      expect(hasRolePermission('ADMIN', 'VERIFY_INSTITUTIONS')).toBe(true);
      expect(hasRolePermission('ADMIN', 'CONFIGURE_PLATFORM')).toBe(true);
    });

    it('returns false for PUBLIC with any restricted permission', () => {
      expect(hasRolePermission('PUBLIC', 'CREATE_BLOOD_REQUEST')).toBe(false);
      expect(hasRolePermission('PUBLIC', 'MANAGE_BLOOD_BANK_INVENTORY')).toBe(false);
    });
  });

  describe('Blood Component Labels', () => {
    it('has label for each component', () => {
      expect(BLOOD_COMPONENT_LABELS.WHOLE_BLOOD).toBe('Whole Blood');
      expect(BLOOD_COMPONENT_LABELS.PRBC).toBe('Packed RBC (PRBC)');
      expect(BLOOD_COMPONENT_LABELS.PLATELETS).toBe('Platelets (RDP/SDP)');
      expect(BLOOD_COMPONENT_LABELS.FFP).toBe('Fresh Frozen Plasma');
      expect(BLOOD_COMPONENT_LABELS.CRYO).toBe('Cryoprecipitate');
    });
  });

  describe('Role Display Names', () => {
    it('has display name for each role', () => {
      expect(ROLE_DISPLAY_NAMES.PUBLIC).toBe('Public Searcher');
      expect(ROLE_DISPLAY_NAMES.HOSPITAL_COORDINATOR).toBe('Hospital Coordinator');
      expect(ROLE_DISPLAY_NAMES.BLOOD_BANK_OFFICER).toBe('Blood Bank Officer');
      expect(ROLE_DISPLAY_NAMES.ADMIN).toBe('Network Admin');
    });
  });

  describe('Indian States Demo', () => {
    it('has 9 demo states', () => {
      expect(INDIAN_STATES_DEMO).toHaveLength(9);
    });

    it('contains major Indian states', () => {
      expect(INDIAN_STATES_DEMO).toContain('Maharashtra');
      expect(INDIAN_STATES_DEMO).toContain('Karnataka');
      expect(INDIAN_STATES_DEMO).toContain('Delhi NCR');
      expect(INDIAN_STATES_DEMO).toContain('Tamil Nadu');
      expect(INDIAN_STATES_DEMO).toContain('Telangana');
    });
  });
});