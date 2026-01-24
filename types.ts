
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_OWNER = 'GYM_OWNER',
}

export interface User {
  id: number;
  email: string;
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
  ownerEmail: string;
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
  email: string;
  phone: string;
  planStart: string;
  planDurationDays: number;
  feesAmount: number;
  feesStatus: PaymentStatus;
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
