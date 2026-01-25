
import mongoose from 'mongoose';
import { UserRole } from '../../types';

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  gymId: { type: Number, ref: 'Gym' },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
