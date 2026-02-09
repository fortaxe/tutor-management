
import mongoose from 'mongoose';
import { PaymentMode } from '../types';

const studentPaymentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    tutorId: { type: Number, ref: 'Tutor', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    note: { type: String },
    paymentMode: { type: String, enum: Object.values(PaymentMode), required: true }
}, { timestamps: true });

export const StudentPaymentRecord = mongoose.models.StudentPayment || mongoose.model('StudentPayment', studentPaymentSchema);
