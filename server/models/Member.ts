
import mongoose from 'mongoose';
import { PaymentStatus, MemberType } from '../types';

const memberSchema = new mongoose.Schema({
  gymId: { type: Number, required: true, ref: 'Gym' },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true, unique: true },
  planStart: { type: String, required: true },
  planDurationDays: { type: Number, required: true },
  feesAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  feesStatus: { type: String, enum: Object.values(PaymentStatus), required: true },
  memberType: { type: String, enum: Object.values(MemberType), required: true },
  photo: String,
  dob: String,
}, { timestamps: true });

export const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);
