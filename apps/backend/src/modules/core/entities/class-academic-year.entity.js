import mongoose from 'mongoose';

const classAcademicYearSchema = new mongoose.Schema(
  {
    academic_year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    homeroom_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffAccount', default: null }
  },
  {
    timestamps: false,
    collection: 'class_academic_years'
  }
);

classAcademicYearSchema.index({ academic_year_id: 1, class_id: 1 }, { unique: true });

export const ClassAcademicYear = mongoose.model('ClassAcademicYear', classAcademicYearSchema);