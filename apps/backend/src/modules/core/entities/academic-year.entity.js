import mongoose from 'mongoose';

const { Schema } = mongoose;

const AcademicYearSchema = new Schema(
  {
    start_year: {
      type: Number,
      required: true,
    },
    end_year: {
      type: Number,
      required: true,
    },
    is_current: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const AcademicYear = mongoose.model('AcademicYear', AcademicYearSchema, 'academic_years');
