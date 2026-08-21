import mongoose from 'mongoose';
import { DiplomaStatus } from '../enums.js';

const diplomaSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentAccount',
      required: true,
      unique: true
    },
    graduation_academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(DiplomaStatus),
      default: DiplomaStatus.NOT_STORED
    },
    diploma_number: {
      type: String,
      trim: true,
      default: null,
      index: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'diplomas'
  }
);


diplomaSchema.index({ student_id: 1 }, { unique: true });

diplomaSchema.index({ graduation_academic_year_id: 1, status: 1 });

export const Diploma = mongoose.model('Diploma', diplomaSchema);