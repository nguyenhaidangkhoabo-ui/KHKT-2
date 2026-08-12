import mongoose from 'mongoose';
import { StudentRole, UserStatus, AcademicStatusType, GenderType } from '../enums.js';

const { Schema } = mongoose;

const StudentAccountSchema = new Schema(
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
      enum: Object.values(StudentRole),
      default: StudentRole.STUDENT,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    // Student profile info
    student_code: {
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
    birthdate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(GenderType),
      default: null,
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
    father_phone: {
      type: String,
      trim: true,
      default: null,
    },
    mother_phone: {
      type: String,
      trim: true,
      default: null,
    },
    enrollment_year: {
      type: Number,
      required: true,
    },
    academic_status: {
      type: String,
      enum: Object.values(AcademicStatusType),
      default: AcademicStatusType.ACTIVE,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

StudentAccountSchema.index({ username: 1 }, { unique: true, name: 'uk_student_username' });
StudentAccountSchema.index({ student_code: 1 }, { unique: true, name: 'uk_student_code' });
StudentAccountSchema.index({ full_name: 'text' }, { name: 'idx_student_fullname_text' });

export const StudentAccount = mongoose.model('StudentAccount', StudentAccountSchema, 'student_accounts');
