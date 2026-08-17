import mongoose from 'mongoose';

const studentClassAcademicYearSchema = new mongoose.Schema(
  {
    class_academic_year_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassAcademicYear', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentAccount', required: true }
  },
  {
    timestamps: false,
    collection: 'student_class_academic_years'
  }
);

studentClassAcademicYearSchema.index({ class_academic_year_id: 1, student_id: 1 }, { unique: true });

export const StudentClassAcademicYear = mongoose.model('StudentClassAcademicYear', studentClassAcademicYearSchema);
