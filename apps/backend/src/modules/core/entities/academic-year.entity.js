import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    start_year: { type: Number, required: true },
    end_year: { type: Number, required: true },
    is_current: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'academic_years'
  }
);

export const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
