
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  GYM_OWNER = 'GYM_OWNER',
  TRAINER = 'TRAINER',
}

export interface User {
  _id?: string;
  id?: number;
  phone: string;
  name?: string;
  password?: string;
  role: UserRole;
  gymId?: number;
  gymStatus?: GymStatus;
  gymSubscriptionEndDate?: string;
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
  PARTIAL = 'Partial',
}

export enum MemberType {
  SUBSCRIPTION = 'Subscription',
  DAY_PASS = 'Day Pass',
}

export enum PaymentMode {
  CASH = 'Cash',
  UPI = 'UPI',
}

export interface Member {
  _id?: string;
  id?: number;
  gymId: number;
  name: string;
  email?: string;
  phone: string;
  planStart: string;
  planDurationDays: number;
  feesAmount: number; // Total Plan Fee
  paidAmount: number; // Total Collected Fee
  feesStatus: PaymentStatus;
  memberType: MemberType;
  photo?: string; // Base64 encoded image
  dob?: string;
  paymentMode?: PaymentMode;
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
