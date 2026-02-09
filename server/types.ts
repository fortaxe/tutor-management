
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TUTOR = 'TUTOR',
  ASSISTANT = 'ASSISTANT',
}

export interface User {
  id: number;
  phone: string;
  name?: string;
  password?: string;
  role: UserRole;
  tutorId?: number;
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
  name: string; // Tutor/Center Name
  ownerName?: string; // Tutor Name
  ownerPhone: string;
  state?: string;
  pincode?: string;
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
  id: number;
  tutorId: number;
  name: string;
  email?: string;
  studentPhone?: string; // Optional
  parentName: string; // Mandatory
  parentPhone: string; // Mandatory
  planStart: string;
  planDurationMonths: number; // Changed from Days to Months
  feesAmount: number;
  paidAmount: number;
  feesStatus: PaymentStatus;
  studentType: StudentType;
  photo?: string;
  paymentMode?: PaymentMode;
  dob?: string;
  studentClass: string;
  subjects: string;
  board: string;
}

export interface StudentPayment {
  id: number;
  studentId: number;
  studentName: string;
  tutorId: number;
  amount: number;
  paymentDate: string;
  note: string;
  paymentMode?: PaymentMode;
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
