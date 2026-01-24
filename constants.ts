
import { User, Gym, Member, UserRole, GymStatus, SubscriptionStatus, PaymentStatus } from './types';

export const USERS: User[] = [
  { id: 1, email: 'admin@gymsaas.com', role: UserRole.SUPER_ADMIN },
  { id: 2, email: 'owner@powerhouse.com', role: UserRole.GYM_OWNER, gymId: 1 },
];

export const GYMS: Gym[] = [
  {
    id: 1,
    name: 'Powerhouse Fitness',
    ownerEmail: 'owner@powerhouse.com',
    status: GymStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    nextPaymentDue: '2024-08-15',
  },
  {
    id: 2,
    name: 'Iron Temple Gym',
    ownerEmail: 'manager@irontemple.com',
    status: GymStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.PENDING,
    nextPaymentDue: '2024-07-25',
  },
  {
    id: 3,
    name: 'Cardio Central',
    ownerEmail: 'contact@cardiocentral.com',
    status: GymStatus.SUSPENDED,
    subscriptionStatus: SubscriptionStatus.EXPIRED,
    nextPaymentDue: '2024-06-30',
  },
];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const MEMBERS: Member[] = [
  {
    id: 1,
    gymId: 1,
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '123-456-7890',
    planStart: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)), // Started 20 days ago
    planDurationDays: 30,
    feesAmount: 500,
    feesStatus: PaymentStatus.PAID,
  },
  {
    id: 2,
    gymId: 1,
    name: 'Bob Williams',
    email: 'bob@email.com',
    phone: '234-567-8901',
    planStart: formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)), // Started 60 days ago
    planDurationDays: 90,
    feesAmount: 1200,
    feesStatus: PaymentStatus.PAID,
  },
  {
    id: 3,
    gymId: 1,
    name: 'Charlie Brown',
    email: 'charlie@email.com',
    phone: '345-678-9012',
    planStart: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), // Started 15 days ago
    planDurationDays: 30,
    feesAmount: 500,
    feesStatus: PaymentStatus.UNPAID,
  },
  {
    id: 4,
    gymId: 1,
    name: 'Diana Prince',
    email: 'diana@email.com',
    phone: '456-789-0123',
    planStart: formatDate(new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000)), // Started 40 days ago (Expired)
    planDurationDays: 30,
    feesAmount: 500,
    feesStatus: PaymentStatus.PAID,
  },
  {
    id: 5,
    gymId: 1,
    name: 'Ethan Hunt',
    email: 'ethan@email.com',
    phone: '567-890-1234',
    planStart: formatDate(new Date(today.getTime())), // Starts today
    planDurationDays: 180,
    feesAmount: 2500,
    feesStatus: PaymentStatus.UNPAID,
  },
  {
    id: 6,
    gymId: 1,
    name: 'Fiona Glenanne',
    email: 'fiona@email.com',
    phone: '678-901-2345',
    planStart: formatDate(new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000)), // Expiring in 5 days
    planDurationDays: 30,
    feesAmount: 500,
    feesStatus: PaymentStatus.PAID,
  },
  {
    id: 7,
    gymId: 2, // Belongs to another gym
    name: 'George Costanza',
    email: 'george@email.com',
    phone: '789-012-3456',
    planStart: formatDate(new Date()),
    planDurationDays: 30,
    feesAmount: 450,
    feesStatus: PaymentStatus.PAID,
  },
];
