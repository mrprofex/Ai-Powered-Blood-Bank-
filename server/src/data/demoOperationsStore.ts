import type { UserRole } from '../../../shared/constants/bloodNetwork.ts';
import type {
  DemoAuditLogEntry,
  DemoHospitalRequestRecord,
  DemoStockMovement,
  DemoVerificationRecord,
} from '../../../shared/types/network.ts';

export const demoHospitalRequestsStore: DemoHospitalRequestRecord[] = [
  {
    id: 'REQ-DEMO-841',
    department: 'Emergency Trauma Bay 2',
    hospitalName: 'KEM Trauma Unit (Demo)',
    city: 'Mumbai',
    bloodGroup: 'O-',
    component: 'PRBC',
    units: 6,
    urgency: 'CRITICAL',
    status: 'MATCHED',
    matchedBank: 'KEM Regional Blood Center (Demo)',
    etaMinutes: 28,
    createdAt: '2026-11-25T14:12:00Z',
    createdBy: 'Dr. Priya Sharma (Demo)',
    notes: 'Road trauma resuscitation bay priority dispatch.',
    isDemoData: true,
  },
  {
    id: 'REQ-DEMO-842',
    department: 'Obstetrics & Gynecology',
    hospitalName: 'Sassoon General Hospital (Demo)',
    city: 'Pune',
    bloodGroup: 'B-',
    component: 'PRBC',
    units: 4,
    urgency: 'HIGH',
    status: 'OPEN',
    matchedBank: 'Pending Allocation',
    etaMinutes: 45,
    createdAt: '2026-11-25T13:50:00Z',
    createdBy: 'Dr. Kavita Deshmukh (Demo)',
    notes: 'Postpartum hemorrhage readiness crossmatch.',
    isDemoData: true,
  },
  {
    id: 'REQ-DEMO-843',
    department: 'Cardiothoracic Surgery',
    hospitalName: 'Metro Trauma Center (Demo)',
    city: 'Bengaluru',
    bloodGroup: 'A+',
    component: 'PLATELETS',
    units: 8,
    urgency: 'ROUTINE',
    status: 'ALLOCATED',
    matchedBank: 'Manipal Old Airport Blood Center (Demo)',
    etaMinutes: 35,
    createdAt: '2026-11-25T12:25:00Z',
    createdBy: 'Dr. Priya Sharma (Demo)',
    notes: 'Scheduled CABG surgical reserve.',
    isDemoData: true,
  },
  {
    id: 'REQ-DEMO-844',
    department: 'Oncology Day Care',
    hospitalName: 'Safdarjung Trauma Center (Demo)',
    city: 'New Delhi',
    bloodGroup: 'AB-',
    component: 'FFP',
    units: 5,
    urgency: 'HIGH',
    status: 'MATCHED',
    matchedBank: 'Safdarjung Trauma Blood Center (Demo)',
    etaMinutes: 22,
    createdAt: '2026-11-25T11:40:00Z',
    createdBy: 'Dr. Arvind Mehta (Demo)',
    notes: 'Coagulopathy support protocol.',
    isDemoData: true,
  },
];

export const demoStockMovementsStore: DemoStockMovement[] = [
  {
    id: 'MOV-DEMO-101',
    batchCode: 'BATCH-MH-2041 (Demo)',
    bloodGroup: 'O+',
    component: 'PLATELETS',
    movementType: 'EXPIRY_FLAG',
    unitsDelta: 18,
    resultingUnits: 18,
    storageUnit: 'Agitator Rack B-02',
    expiryDate: '2026-11-27',
    notes: 'Flagged within 36h expiry window for priority FEFO transfer.',
    actorName: 'Rajesh Kulkarni (Demo)',
    actorRole: 'BLOOD_BANK_OFFICER',
    institutionName: 'KEM Regional Blood Center (Demo)',
    timestamp: '2026-11-25T14:05:00Z',
    isDemoData: true,
  },
  {
    id: 'MOV-DEMO-102',
    batchCode: 'BATCH-MH-2044 (Demo)',
    bloodGroup: 'O-',
    component: 'PRBC',
    movementType: 'DISPATCH_OUT',
    unitsDelta: 6,
    resultingUnits: 14,
    storageUnit: 'Cold Vault A-01 (4°C)',
    expiryDate: '2026-12-01',
    counterparty: 'KEM Trauma Unit (Demo)',
    notes: 'Matched to REQ-DEMO-841 trauma bay request.',
    actorName: 'Rajesh Kulkarni (Demo)',
    actorRole: 'BLOOD_BANK_OFFICER',
    institutionName: 'KEM Regional Blood Center (Demo)',
    timestamp: '2026-11-25T13:45:00Z',
    isDemoData: true,
  },
  {
    id: 'MOV-DEMO-103',
    batchCode: 'BATCH-MH-2049 (Demo)',
    bloodGroup: 'B+',
    component: 'PRBC',
    movementType: 'DONATION_IN',
    unitsDelta: 24,
    resultingUnits: 86,
    storageUnit: 'Cold Vault A-04 (4°C)',
    expiryDate: '2026-12-18',
    counterparty: 'Voluntary Camp · Dadar West (Demo)',
    notes: 'Post-screening release into refrigerated inventory.',
    actorName: 'Rajesh Kulkarni (Demo)',
    actorRole: 'BLOOD_BANK_OFFICER',
    institutionName: 'KEM Regional Blood Center (Demo)',
    timestamp: '2026-11-25T11:15:00Z',
    isDemoData: true,
  },
];

export const demoVerificationsStore: DemoVerificationRecord[] = [
  {
    id: 'VER-DEMO-01',
    organizationName: 'Deccan Multispecialty Trauma Center (Demo)',
    type: 'HOSPITAL',
    city: 'Pune',
    state: 'Maharashtra',
    licenseNumber: 'MH-SBTC-DEMO-9012',
    submittedAt: '2026-11-25T09:15:00Z',
    status: 'PENDING',
    isDemoData: true,
  },
  {
    id: 'VER-DEMO-02',
    organizationName: 'Kaveri Voluntary Blood Bank (Demo)',
    type: 'BLOOD_BANK',
    city: 'Mysuru',
    state: 'Karnataka',
    licenseNumber: 'KA-CDSCO-DEMO-4418',
    submittedAt: '2026-11-24T17:40:00Z',
    status: 'PENDING',
    isDemoData: true,
  },
  {
    id: 'VER-DEMO-03',
    organizationName: 'Madras Medical Blood Bank (Demo)',
    type: 'BLOOD_BANK',
    city: 'Chennai',
    state: 'Tamil Nadu',
    licenseNumber: 'TN-SBTC-DEMO-1180',
    submittedAt: '2026-11-22T11:05:00Z',
    status: 'VERIFIED',
    reviewNote: 'Verified SBTC & CDSCO demo license record.',
    isDemoData: true,
  },
];

export interface DemoManagedEntity {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'BLOOD_BANK';
  city: string;
  state: string;
  licenseRef: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
  unitsOrBedsLabel: string;
  contactEmail?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  isDemoData: true;
}

export const demoInstitutionsStore: DemoManagedEntity[] = [
  {
    id: 'INST-DEMO-H1',
    name: 'Metro Trauma Center (Demo)',
    type: 'HOSPITAL',
    city: 'Bengaluru',
    state: 'Karnataka',
    licenseRef: 'KA-HOSP-DEMO-108',
    status: 'ACTIVE',
    unitsOrBedsLabel: '420 Beds · 4 Active Req',
    isDemoData: true,
  },
  {
    id: 'INST-DEMO-H2',
    name: 'KEM Trauma Unit (Demo)',
    type: 'HOSPITAL',
    city: 'Mumbai',
    state: 'Maharashtra',
    licenseRef: 'MH-HOSP-DEMO-204',
    status: 'ACTIVE',
    unitsOrBedsLabel: '680 Beds · 6 Active Req',
    isDemoData: true,
  },
  {
    id: 'INST-DEMO-H3',
    name: 'Deccan Multispecialty Trauma Center (Demo)',
    type: 'HOSPITAL',
    city: 'Pune',
    state: 'Maharashtra',
    licenseRef: 'MH-SBTC-DEMO-9012',
    status: 'UNDER_REVIEW',
    unitsOrBedsLabel: '310 Beds · Onboarding',
    isDemoData: true,
  },
  {
    id: 'INST-DEMO-B1',
    name: 'KEM Regional Blood Center (Demo)',
    type: 'BLOOD_BANK',
    city: 'Mumbai',
    state: 'Maharashtra',
    licenseRef: 'MH-BB-DEMO-312',
    status: 'ACTIVE',
    unitsOrBedsLabel: '140 Units · 18 Expiring <72h',
    isDemoData: true,
  },
  {
    id: 'INST-DEMO-B2',
    name: 'Victoria Regional Blood Hub (Demo)',
    type: 'BLOOD_BANK',
    city: 'Bengaluru',
    state: 'Karnataka',
    licenseRef: 'KA-BB-DEMO-190',
    status: 'ACTIVE',
    unitsOrBedsLabel: '210 Units · Nominal',
    isDemoData: true,
  },
  {
    id: 'INST-DEMO-B3',
    name: 'Kaveri Voluntary Blood Bank (Demo)',
    type: 'BLOOD_BANK',
    city: 'Mysuru',
    state: 'Karnataka',
    licenseRef: 'KA-CDSCO-DEMO-4418',
    status: 'UNDER_REVIEW',
    unitsOrBedsLabel: '85 Units · Onboarding',
    isDemoData: true,
  },
];

export interface DemoManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  city: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
  isDemoData: true;
}

export const demoUsersStore: DemoManagedUser[] = [
  {
    id: 'USR-DEMO-01',
    name: 'Dr. Priya Sharma (Demo)',
    email: 'priya.sharma@metro-trauma-demo.in',
    role: 'HOSPITAL_COORDINATOR',
    institution: 'Metro Trauma Center (Demo)',
    city: 'Bengaluru',
    status: 'ACTIVE',
    isDemoData: true,
  },
  {
    id: 'USR-DEMO-02',
    name: 'Rajesh Kulkarni (Demo)',
    email: 'rajesh@kem-bloodbank-demo.in',
    role: 'BLOOD_BANK_OFFICER',
    institution: 'KEM Regional Blood Center (Demo)',
    city: 'Mumbai',
    status: 'ACTIVE',
    isDemoData: true,
  },
  {
    id: 'USR-DEMO-03',
    name: 'Vikram Nair (Demo)',
    email: 'vikram.nair@state-blood-grid-demo.in',
    role: 'ADMIN',
    institution: 'State Health Coordination Cell (Demo)',
    city: 'New Delhi',
    status: 'ACTIVE',
    isDemoData: true,
  },
  {
    id: 'USR-DEMO-04',
    name: 'Dr. Kavita Deshmukh (Demo)',
    email: 'kavita@sassoon-demo.in',
    role: 'HOSPITAL_COORDINATOR',
    institution: 'Sassoon General Hospital (Demo)',
    city: 'Pune',
    status: 'ACTIVE',
    isDemoData: true,
  },
];

export const demoAuditLogsStore: DemoAuditLogEntry[] = [
  {
    id: 'AUD-DEMO-501',
    actorName: 'Rajesh Kulkarni (Demo)',
    actorRole: 'BLOOD_BANK_OFFICER',
    institutionName: 'KEM Regional Blood Center (Demo)',
    action: 'INVENTORY_DISPATCH',
    target: 'BATCH-MH-2044 (Demo)',
    outcome: 'ALLOWED',
    details: 'Dispatched 6u O- PRBC for REQ-DEMO-841 in Mumbai.',
    timestamp: '2026-11-25T13:45:00Z',
    isDemoData: true,
  },
  {
    id: 'AUD-DEMO-502',
    actorName: 'Dr. Priya Sharma (Demo)',
    actorRole: 'HOSPITAL_COORDINATOR',
    institutionName: 'Metro Trauma Center (Demo)',
    action: 'CREATE_BLOOD_REQUEST',
    target: 'REQ-DEMO-843',
    outcome: 'ALLOWED',
    details: 'Created routine surgical request for 8u A+ Platelets.',
    timestamp: '2026-11-25T12:25:00Z',
    isDemoData: true,
  },
  {
    id: 'AUD-DEMO-503',
    actorName: 'Vikram Nair (Demo)',
    actorRole: 'ADMIN',
    institutionName: 'State Health Coordination Cell (Demo)',
    action: 'INSTITUTION_VERIFICATION',
    target: 'VER-DEMO-03',
    outcome: 'ALLOWED',
    details: 'Approved SBTC demo onboarding for Madras Medical Blood Bank (Demo).',
    timestamp: '2026-11-22T11:05:00Z',
    isDemoData: true,
  },
];

export function appendDemoAuditLog(
  entry: Omit<DemoAuditLogEntry, 'id' | 'timestamp' | 'isDemoData'>,
): DemoAuditLogEntry {
  const newEntry: DemoAuditLogEntry = {
    id: `AUD-DEMO-${Date.now().toString().slice(-5)}`,
    ...entry,
    timestamp: new Date().toISOString(),
    isDemoData: true,
  };
  demoAuditLogsStore.unshift(newEntry);
  if (demoAuditLogsStore.length > 100) {
    demoAuditLogsStore.length = 100;
  }
  return newEntry;
}
