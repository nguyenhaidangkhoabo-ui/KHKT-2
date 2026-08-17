import mongoose from 'mongoose';
import { UserRole, UserStatus } from '../enums.js';

const staffAccountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: [UserRole.TEACHER, UserRole.BGH, UserRole.ADMIN, UserRole.SYSTEM_ADMIN],
      default: UserRole.TEACHER,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE
    },
    staff_code: { type: String, required: true, unique: true, trim: true },
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'staff_accounts'
  }
);

export const StaffAccount = mongoose.model('StaffAccount', staffAccountSchema);
