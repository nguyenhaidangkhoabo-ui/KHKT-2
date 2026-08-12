import mongoose from 'mongoose';
import { TeacherRole, UserStatus } from '../enums.js';

const { Schema } = mongoose;

const TeacherAccountSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(TeacherRole),
      default: TeacherRole.TEACHER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    // Teacher profile info
    teacher_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

TeacherAccountSchema.index({ username: 1 }, { unique: true, name: 'uk_teacher_username' });
TeacherAccountSchema.index({ teacher_code: 1 }, { unique: true, name: 'uk_teacher_code' });

export const TeacherAccount = mongoose.model('TeacherAccount', TeacherAccountSchema, 'teacher_accounts');
