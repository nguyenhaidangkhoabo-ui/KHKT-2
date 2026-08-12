import mongoose from 'mongoose';

const { Schema } = mongoose;

const StudentClassAcademicYearSchema = new Schema(
  {
    class_academic_year_id: {
      type: Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'StudentAccount',
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

StudentClassAcademicYearSchema.index(
  { class_academic_year_id: 1, student_id: 1 },
  { unique: true, name: 'uk_class_academic_year_student' }
);
StudentClassAcademicYearSchema.index(
  { student_id: 1 },
  { name: 'idx_mapping_student_id' }
);

export const StudentClassAcademicYear = mongoose.model(
  'StudentClassAcademicYear',
  StudentClassAcademicYearSchema,
  'student_class_academic_years'
);
