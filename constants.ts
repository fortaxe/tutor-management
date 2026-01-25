
import { User, Gym, Member, UserRole, GymStatus, SubscriptionStatus, PaymentStatus, MemberPayment, MemberType } from './types';

export const USERS: User[] = [
  { id: 1, phone: '9999999999', password: 'admin', role: UserRole.SUPER_ADMIN },
  { id: 2, phone: '8888888888', password: 'owner', role: UserRole.GYM_OWNER, gymId: 1 },
  { id: 3, phone: '7777777777', password: 'trainer', role: UserRole.TRAINER, gymId: 1 },
];

export const GYMS: Gym[] = [
  {
    id: 1,
    name: 'Powerhouse Fitness',
    ownerPhone: '8888888888',
    status: GymStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    subscriptionStartDate: '2024-07-15',
    subscriptionEndDate: '2025-07-15',
    totalPaidAmount: 3600,
    paymentHistory: [
      {
        id: 101,
        amount: 3600,
        startDate: '2024-07-15',
        endDate: '2025-07-15',
        paymentDate: '2024-07-14',
        note: 'Yearly Plan Upgrade',
      }
    ],
  },
  {
    id: 2,
    name: 'Iron Temple Gym',
    ownerPhone: '7777777777',
    status: GymStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.PENDING,
    subscriptionStartDate: '2024-06-25',
    subscriptionEndDate: '2024-07-25',
    totalPaidAmount: 0,
    paymentHistory: [],
  },
];

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const today = new Date();

export const MEMBERS: Member[] = [
  {
    id: 1,
    gymId: 1,
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '1234567890',
    planStart: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
    planDurationDays: 30,
    feesAmount: 1500,
    paidAmount: 1500,
    feesStatus: PaymentStatus.PAID,
    memberType: MemberType.SUBSCRIPTION,
  },
  {
    id: 2,
    gymId: 1,
    name: 'Bob Williams',
    email: 'bob@email.com',
    phone: '2345678901',
    planStart: formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
    planDurationDays: 90,
    feesAmount: 5000,
    paidAmount: 4000,
    feesStatus: PaymentStatus.PARTIAL,
    memberType: MemberType.SUBSCRIPTION,
  },
];

export const MEMBER_PAYMENTS: MemberPayment[] = [
  { id: 1, memberId: 1, memberName: 'Alice Johnson', gymId: 1, amount: 1500, paymentDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 5)), note: 'Initial Payment' },
  { id: 2, memberId: 2, memberName: 'Bob Williams', gymId: 1, amount: 4000, paymentDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 15)), note: 'Initial Partial Payment' },
];
