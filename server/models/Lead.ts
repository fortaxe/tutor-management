
import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    gymOwnerName: { type: String, required: true },
    gymName: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'rejected'], default: 'new' }
}, { timestamps: true });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
