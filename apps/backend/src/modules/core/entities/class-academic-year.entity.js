import mongoose from 'mongoose';

const { Schema } = mongoose;

const ClassAcademicYearSchema = new Schema(
  {
    academic_year_id: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    class_id: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    homeroom_teacher_id: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherAccount',
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

ClassAcademicYearSchema.index(
  { academic_year_id: 1, class_id: 1 },
  { unique: true, name: 'uk_academic_year_class' }
);

export const ClassAcademicYear = mongoose.model(
  'ClassAcademicYear',
  ClassAcademicYearSchema,
  'class_academic_years'
);
