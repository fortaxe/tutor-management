
import { z } from 'zod';
import { UserRole, TutorStatus, SubscriptionStatus, PaymentStatus, StudentType, PaymentMode } from '../types';

export const loginSchema = z.object({
  phone: z.string().length(10),
  password: z.string().min(4),
});

export const tutorSchemaValidation = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2).optional(),
  ownerPhone: z.string().length(10),
  state: z.string().optional(),
  pincode: z.string().length(6).optional(),
  status: z.nativeEnum(TutorStatus),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus),
  subscriptionStartDate: z.string(),
  subscriptionEndDate: z.string(),
  totalPaidAmount: z.number(),
});

export const studentSchemaValidation = z.object({
  name: z.string().min(2),
  studentPhone: z.string().length(10).optional().or(z.literal('')),
  parentName: z.string().min(2),
  parentPhone: z.string().length(10),
  email: z.string().email().optional().or(z.literal('')),
  planStart: z.string(),
  planDurationMonths: z.coerce.number(),
  feesAmount: z.coerce.number(),
  paidAmount: z.coerce.number(),
  feesStatus: z.nativeEnum(PaymentStatus),
  studentType: z.nativeEnum(StudentType),
  photo: z.string().optional(),
  dob: z.string().optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  studentClass: z.string().min(1),
  subjects: z.string().min(1),
  board: z.string().min(1),
});

export const leadSchemaValidation = z.object({
  tutorOwnerName: z.string().min(2),
  tutorName: z.string().min(2),
  phone: z.string().length(10),
});
