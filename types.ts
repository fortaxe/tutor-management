
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_OWNER = 'GYM_OWNER',
  TRAINER = 'TRAINER',
}

export interface User {
  id: string | number;
  phone: string;
  password?: string;
  role: UserRole;
  gymId?: string | number;
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
  id: string | number;
  amount: number;
  startDate: string;
  endDate: string;
  paymentDate: string;
  note: string;
}

export interface Gym {
  id: string | number;
  name: string;
  ownerPhone: string;
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
  id: string | number;
  gymId: string | number;
  name: string;
  email?: string;
  phone: string;
  planStart: string;
  planDurationDays: number;
  feesAmount: number;
  feesStatus: PaymentStatus;
  photo?: string;
}

export interface MemberPayment {
  id: string | number;
  memberId: string | number;
  memberName: string;
  gymId: string | number;
  amount: number;
  paymentDate: string;
  note: string;
}
