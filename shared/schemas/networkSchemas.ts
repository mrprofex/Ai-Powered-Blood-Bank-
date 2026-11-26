import { z } from 'zod';
import {
  BLOOD_COMPONENTS,
  BLOOD_GROUPS,
  RISK_LEVELS,
  STOCK_MOVEMENT_TYPES,
  USER_ROLES,
} from '../constants/bloodNetwork.ts';

export const AvailabilityQuerySchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  component: z.enum(BLOOD_COMPONENTS).optional(),
  state: z.string().trim().min(1).max(60).optional(),
  riskLevel: z.enum(RISK_LEVELS).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type AvailabilityQueryInput = z.infer<typeof AvailabilityQuerySchema>;

export const DemoLoginInputSchema = z.object({
  email: z.string().trim().email('Enter a valid institutional email address').max(120),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(USER_ROLES).default('HOSPITAL_COORDINATOR'),
});

export type DemoLoginInput = z.infer<typeof DemoLoginInputSchema>;

export const DemoSignupInputSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  organizationName: z.string().trim().min(3, 'Organization name is required').max(150),
  email: z.string().trim().email('Enter a valid email address').max(120),
  city: z.string().trim().min(2, 'City is required').max(80),
  state: z.string().trim().min(2, 'State is required').max(80),
  role: z.enum(['HOSPITAL_COORDINATOR', 'BLOOD_BANK_OFFICER', 'PUBLIC']),
  licenseReference: z.string().trim().max(60).optional(),
});

export type DemoSignupInput = z.infer<typeof DemoSignupInputSchema>;

export const OrganizationOnboardingSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    organizationName: z.string().trim().min(3).max(150),
    contactEmail: z.string().trim().email().max(120),
    contactPhone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s()-]{8,20}$/, 'Enter a valid contact phone number'),
    organizationType: z.enum(['HOSPITAL', 'BLOOD_BANK']),
    licenseNumber: z.string().trim().min(3).max(80),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    bedCapacity: z.coerce.number().int().min(1).max(200000).optional(),
    storageCapacityUnits: z.coerce.number().int().min(1).max(200000).optional(),
  })
  .superRefine((value, context) => {
    if ((value.latitude === undefined) !== (value.longitude === undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitude'],
        message: 'Provide both latitude and longitude, or leave both blank.',
      });
    }
    if (value.organizationType === 'HOSPITAL' && value.bedCapacity === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bedCapacity'],
        message: 'Hospital bed capacity is required.',
      });
    }
    if (value.organizationType === 'BLOOD_BANK' && value.storageCapacityUnits === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['storageCapacityUnits'],
        message: 'Blood-bank storage capacity is required.',
      });
    }
  });

export type OrganizationOnboardingInput = z.infer<typeof OrganizationOnboardingSchema>;

export const DemoRequestValidationSchema = z
  .object({
    hospitalName: z.string().trim().min(3).max(150),
    department: z.string().trim().min(2).max(100).default('Emergency Trauma Unit'),
    bloodGroup: z.enum(BLOOD_GROUPS),
    component: z.enum(BLOOD_COMPONENTS),
    unitsNeeded: z.coerce.number().int().min(1).max(50),
    urgency: z.enum(['CRITICAL', 'HIGH', 'ROUTINE']),
    city: z.string().trim().min(2).max(80),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    notes: z.string().trim().max(300).optional(),
  })
  .superRefine((value, context) => {
    if ((value.latitude === undefined) !== (value.longitude === undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitude'],
        message: 'Provide both latitude and longitude, or leave both blank.',
      });
    }
  });

export type DemoRequestValidationInput = z.infer<typeof DemoRequestValidationSchema>;

export const BloodStockUpdateSchema = z
  .object({
    batchCode: z.string().trim().min(3).max(60),
    bloodGroup: z.enum(BLOOD_GROUPS),
    component: z.enum(BLOOD_COMPONENTS),
    movementType: z.enum(STOCK_MOVEMENT_TYPES),
    unitsDelta: z.coerce.number().int().min(0).max(500),
    storageUnit: z.string().trim().min(2).max(80),
    expiryDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for expiry date')
      .refine((value) => {
        const parsedDate = new Date(`${value}T00:00:00.000Z`);
        return (
          !Number.isNaN(parsedDate.getTime()) &&
          parsedDate.toISOString().slice(0, 10) === value
        );
      }, 'Enter a real calendar date.'),
    city: z.string().trim().min(2).max(80).optional(),
    state: z.string().trim().min(2).max(80).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    counterparty: z.string().trim().max(150).optional(),
    notes: z.string().trim().max(240).optional(),
  })
  .superRefine((value, context) => {
    if (value.movementType !== 'UPDATE_STOCK' && value.unitsDelta < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unitsDelta'],
        message: 'Units must be at least one for stock movements.',
      });
    }
    if ((value.latitude === undefined) !== (value.longitude === undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitude'],
        message: 'Provide both latitude and longitude, or leave both blank.',
      });
    }
  });

export type BloodStockUpdateInput = z.infer<typeof BloodStockUpdateSchema>;

export const InventoryBatchImportRowSchema = z
  .object({
    batchCode: z.string().trim().min(3).max(60),
    bloodGroup: z.enum(BLOOD_GROUPS),
    component: z.enum(BLOOD_COMPONENTS),
    unitsAvailable: z.coerce.number().int().min(0).max(50000),
    expiryDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for expiry date'),
    storageUnit: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .superRefine((value, context) => {
    if ((value.latitude === undefined) !== (value.longitude === undefined)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitude'],
        message: 'Provide both latitude and longitude, or leave both blank.',
      });
    }
    const parsedDate = new Date(`${value.expiryDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value.expiryDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiryDate'],
        message: 'Enter a real calendar date.',
      });
    }
  });

export const InventoryBatchImportSchema = z.object({
  rows: z.array(InventoryBatchImportRowSchema).min(1).max(200),
});

export type InventoryBatchImportRow = z.infer<typeof InventoryBatchImportRowSchema>;
export type InventoryBatchImportInput = z.infer<typeof InventoryBatchImportSchema>;

export const NearbyMatchQuerySchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(BLOOD_COMPONENTS),
  units: z.coerce.number().int().min(1).max(500),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(500).default(100),
});

export type NearbyMatchQueryInput = z.infer<typeof NearbyMatchQuerySchema>;

export const RequestStatusUpdateSchema = z.object({
  status: z.enum(['OPEN', 'MATCHED', 'ALLOCATED', 'DISPATCHED']),
  matchedBank: z.string().trim().min(2).max(150).optional(),
});

export type RequestStatusUpdateInput = z.infer<typeof RequestStatusUpdateSchema>;

export const AdminVerificationActionSchema = z.object({
  status: z.enum(['VERIFIED', 'PENDING', 'REJECTED']),
  reviewNote: z.string().trim().max(240).optional(),
});

export type AdminVerificationActionInput = z.infer<typeof AdminVerificationActionSchema>;

export const AdminEntityStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'UNDER_REVIEW']),
  reason: z.string().trim().max(240).optional(),
});

export type AdminEntityStatusInput = z.infer<typeof AdminEntityStatusSchema>;
