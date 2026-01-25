
import mongoose from 'mongoose';
import { GymStatus, SubscriptionStatus } from '../types';

const gymSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  status: { type: String, enum: Object.values(GymStatus), default: GymStatus.ACTIVE },
  subscriptionStatus: { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.PENDING },
  subscriptionStartDate: { type: String, required: true },
  subscriptionEndDate: { type: String, required: true },
  totalPaidAmount: { type: Number, default: 0 },
  paymentHistory: [{
    amount: Number,
    startDate: String,
    endDate: String,
    paymentDate: String,
    note: String
  }]
}, { timestamps: true });

export const Gym = mongoose.models.Gym || mongoose.model('Gym', gymSchema);
