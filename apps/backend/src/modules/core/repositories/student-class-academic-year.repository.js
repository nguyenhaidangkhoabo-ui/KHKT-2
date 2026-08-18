import { StudentClassAcademicYear } from '../entities/student-class-academic-year.entity.js';

export class StudentClassAcademicYearRepository {
  static async findStudentsByClassAcademicYear(classAcademicYearId) {
    return await StudentClassAcademicYear.find({ class_academic_year_id: classAcademicYearId })
      .populate({ path: 'student_id', select: '-password_hash' });
  }

  static async findById(id) {
    return await StudentClassAcademicYear.findById(id);
  }

  static async findByClassAndStudent(classAcademicYearId, studentId) {
    return await StudentClassAcademicYear.findOne({
      class_academic_year_id: classAcademicYearId,
      student_id: studentId
    });
  }

  static async addStudentToClass(classAcademicYearId, studentId) {
    return await StudentClassAcademicYear.create({
      class_academic_year_id: classAcademicYearId,
      student_id: studentId
    });
  }

  static async bulkAddStudents(classAcademicYearId, studentIds) {
    const docs = studentIds.map((studentId) => ({
      class_academic_year_id: classAcademicYearId,
      student_id: studentId
    }));
    return await StudentClassAcademicYear.insertMany(docs, { ordered: false });
  }

  static async removeStudent(classAcademicYearId, studentId) {
    return await StudentClassAcademicYear.findOneAndDelete({
      class_academic_year_id: classAcademicYearId,
      student_id: studentId
    });
  }

  static async findAcademicHistoryByStudent(studentId) {
    return await StudentClassAcademicYear.find({ student_id: studentId })
      .populate({
        path: 'class_academic_year_id',
        populate: [
          { path: 'academic_year_id' },
          { path: 'class_id' }
        ]
      });
  }
}