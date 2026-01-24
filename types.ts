
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_OWNER = 'GYM_OWNER',
  TRAINER = 'TRAINER',
}

export interface User {
  id: number;
  phone: string; // Changed from email to phone
  password?: string;
  role: UserRole;
  gymId?: number;
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

export interface SubscriptionPayment {
  id: number;
  amount: number;
  startDate: string;
  endDate: string;
  paymentDate: string;
  note: string;
}

export interface Gym {
  id: number;
  name: string;
  ownerPhone: string; // Changed from ownerEmail to ownerPhone
  status: GymStatus;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  totalPaidAmount: number;
  paymentHistory: SubscriptionPayment[];
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
}

export interface Member {
  id: number;
  gymId: number;
  name: string;
  email?: string;
  phone: string;
  planStart: string;
  planDurationDays: number;
  feesAmount: number;
  feesStatus: PaymentStatus;
  photo?: string; // Base64 encoded image
}

export interface MemberPayment {
  id: number;
  memberId: number;
  memberName: string;
  gymId: number;
  amount: number;
  paymentDate: string;
  note: string;
}
