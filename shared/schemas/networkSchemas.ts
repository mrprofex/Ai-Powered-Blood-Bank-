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

export const DemoRequestValidationSchema = z.object({
  hospitalName: z.string().trim().min(3).max(150),
  department: z.string().trim().min(2).max(100).default('Emergency Trauma Unit'),
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(BLOOD_COMPONENTS),
  unitsNeeded: z.coerce.number().int().min(1).max(50),
  urgency: z.enum(['CRITICAL', 'HIGH', 'ROUTINE']),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(300).optional(),
});

export type DemoRequestValidationInput = z.infer<typeof DemoRequestValidationSchema>;

export const BloodStockUpdateSchema = z.object({
  batchCode: z.string().trim().min(3).max(60),
  bloodGroup: z.enum(BLOOD_GROUPS),
  component: z.enum(BLOOD_COMPONENTS),
  movementType: z.enum(STOCK_MOVEMENT_TYPES),
  unitsDelta: z.coerce.number().int().min(1).max(500),
  storageUnit: z.string().trim().min(2).max(80),
  expiryDate: z.string().trim().min(4).max(40),
  counterparty: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(240).optional(),
});

export type BloodStockUpdateInput = z.infer<typeof BloodStockUpdateSchema>;

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
