
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_OWNER = 'GYM_OWNER',
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  gymId?: number; // Only for GYM_OWNER
}

export enum GymStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  EXPIRED = 'Expired',
}

export interface Gym {
  id: number;
  name: string;
  ownerEmail: string;
  status: GymStatus;
  subscriptionStatus: SubscriptionStatus;
  nextPaymentDue: string;
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
}

export interface Member {
  id: number;
  gymId: number;
  name: string;
  email: string;
  phone: string;
  planStart: string; // ISO string date
  planDurationDays: number;
  feesAmount: number;
  feesStatus: PaymentStatus;
}
