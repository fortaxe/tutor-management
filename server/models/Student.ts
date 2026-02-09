
import mongoose from 'mongoose';
import { PaymentStatus, StudentType, PaymentMode } from '../types';

const studentSchema = new mongoose.Schema({
    tutorId: { type: Number, required: true, ref: 'Tutor' },
    name: { type: String, required: true },
    email: String,
    studentPhone: { type: String, unique: true, sparse: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    planStart: { type: String, required: true },
    planDurationMonths: { type: Number, required: true },
    feesAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    feesStatus: { type: String, enum: Object.values(PaymentStatus), required: true },
    studentType: { type: String, enum: Object.values(StudentType), required: true },
    photo: String,
    dob: String,
    paymentMode: { type: String, enum: Object.values(PaymentMode) },
    studentClass: { type: String, required: true },
    subjects: { type: String, required: true },
    board: { type: String, required: true },
}, { timestamps: true });

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
