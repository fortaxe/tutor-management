
import { z } from 'zod';
import { UserRole, GymStatus, SubscriptionStatus, PaymentStatus, MemberType, PaymentMode } from '../types';

export const loginSchema = z.object({
  phone: z.string().length(10),
  password: z.string().min(4),
});

export const gymSchemaValidation = z.object({
  name: z.string().min(2),
  ownerPhone: z.string().length(10),
  status: z.nativeEnum(GymStatus),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus),
  subscriptionStartDate: z.string(),
  subscriptionEndDate: z.string(),
  totalPaidAmount: z.number(),
});

export const memberSchemaValidation = z.object({
  name: z.string().min(2),
  phone: z.string().length(10),
  email: z.string().email().optional().or(z.literal('')),
  planStart: z.string(),
  planDurationDays: z.coerce.number(),
  feesAmount: z.coerce.number(),
  paidAmount: z.coerce.number(),
  feesStatus: z.nativeEnum(PaymentStatus),
  memberType: z.nativeEnum(MemberType),
  photo: z.string().optional(),
  dob: z.string().optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
});
