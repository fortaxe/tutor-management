
import mongoose from 'mongoose';

const memberPaymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: { type: String, required: true },
  gymId: { type: Number, ref: 'Gym', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: String, required: true },
  note: { type: String }
}, { timestamps: true });

export const MemberPaymentRecord = mongoose.models.MemberPayment || mongoose.model('MemberPayment', memberPaymentSchema);
