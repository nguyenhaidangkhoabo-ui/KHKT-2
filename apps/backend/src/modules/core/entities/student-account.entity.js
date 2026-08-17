import mongoose from 'mongoose';
import { UserRole, UserStatus, AcademicStatus, Gender } from '../enums.js';

const studentAccountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: [UserRole.STUDENT], default: UserRole.STUDENT },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    student_code: { type: String, required: true, unique: true, trim: true },
    full_name: { type: String, required: true, trim: true },
    birthdate: { type: Date, required: true },
    gender: { type: String, enum: Object.values(Gender), required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    father_phone: { type: String, trim: true },
    mother_phone: { type: String, trim: true },
    enrollment_year: { type: Number, required: true },
    academic_status: {
      type: String,
      enum: Object.values(AcademicStatus),
      default: AcademicStatus.ACTIVE
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'student_accounts'
  }
);

export const StudentAccount = mongoose.model('StudentAccount', studentAccountSchema);
