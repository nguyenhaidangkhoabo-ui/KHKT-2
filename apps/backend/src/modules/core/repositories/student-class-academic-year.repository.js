import { StudentClassAcademicYear } from '../entities/student-class-academic-year.entity.js';

export class StudentClassAcademicYearRepository {
  static async findStudentsByClassAcademicYear(classAcademicYearId) {
    return await StudentClassAcademicYear.find({ class_academic_year_id: classAcademicYearId })
      .populate({
        path: 'student_id',
        select: '-password_hash'
      });
  }

  static async addStudentToClass(classAcademicYearId, studentId) {
    return await StudentClassAcademicYear.create({
      class_academic_year_id: classAcademicYearId,
      student_id: studentId
    });
  }
}
