
import mongoose from 'mongoose';
import { TutorStatus, SubscriptionStatus } from '../types';

const tutorSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    ownerName: { type: String },
    ownerPhone: { type: String, required: true, unique: true },
    state: { type: String },
    pincode: { type: String },
    gstNumber: { type: String },
    instagramId: { type: String },
    address: { type: String },
    city: { type: String },
    logo: { type: String },
    status: { type: String, enum: Object.values(TutorStatus), default: TutorStatus.ACTIVE },
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

export const Tutor = mongoose.models.Tutor || mongoose.model('Tutor', tutorSchema);
