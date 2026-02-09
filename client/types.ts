
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TUTOR = 'TUTOR',
  ASSISTANT = 'ASSISTANT',
}

export interface User {
  _id?: string;
  id?: number;
  phone: string;
  name?: string;
  password?: string;
  role: UserRole;
  tutorId?: number;
  tutorStatus?: TutorStatus;
  tutorSubscriptionEndDate?: string;
}

export enum TutorStatus {
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

export interface Tutor {
  id: number;
  name: string;
  ownerName?: string;
  ownerPhone: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  instagramId?: string;
  address?: string;
  city?: string;
  logo?: string;
  status: TutorStatus;
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

export enum StudentType {
  SUBSCRIPTION = 'Subscription',
}

export enum PaymentMode {
  CASH = 'Cash',
  UPI = 'UPI',
}

export interface Student {
  _id?: string;
  id?: number;
  tutorId: number;
  name: string;
  email?: string;
  studentPhone?: string; // Optional
  parentName: string; // Mandatory
  parentPhone: string; // Mandatory
  planStart: string;
  planDurationMonths: number;
  feesAmount: number;
  paidAmount: number;
  feesStatus: PaymentStatus;
  studentType: StudentType;
  photo?: string;
  dob?: string;
  paymentMode?: PaymentMode;
  createdAt?: string;
  studentClass: string;
  subjects: string;
  board: string;
}

export interface StudentPayment {
  _id?: string;
  id?: number;
  studentId: number | string;
  studentName: string;
  tutorId: number;
  amount: number;
  paymentDate: string;
  note: string;
  paymentMode?: PaymentMode;
  createdAt?: string;
}

export interface Lead {
  _id?: string;
  id?: string;
  tutorOwnerName: string;
  tutorName: string;
  phone: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}
