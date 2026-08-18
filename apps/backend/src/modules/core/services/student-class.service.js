import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class StudentClassService {
  static async assign(classAcademicYearId, studentId) {
    const classAY = await ClassAcademicYearRepository.findById(classAcademicYearId);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    const student = await StudentAccountRepository.findById(studentId);
    if (!student) {
      throw new AppError('Không tìm thấy học sinh.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    const existing = await StudentClassAcademicYearRepository.findByClassAndStudent(classAcademicYearId, studentId);
    if (existing) {
      throw new AppError('Học sinh đã ở trong lớp này.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    return await StudentClassAcademicYearRepository.addStudentToClass(classAcademicYearId, studentId);
  }

  static async bulkAssign(classAcademicYearId, studentIds) {
    const classAY = await ClassAcademicYearRepository.findById(classAcademicYearId);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return await StudentClassAcademicYearRepository.bulkAddStudents(classAcademicYearId, studentIds);
  }

  static async remove(classAcademicYearId, studentId) {
    const removed = await StudentClassAcademicYearRepository.removeStudent(classAcademicYearId, studentId);
    if (!removed) {
      throw new AppError('Không tìm thấy liên kết học sinh-lớp.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return removed;
  }

  static async importFromExcel(classAcademicYearId, rows) {
    const results = { success: 0, failed: 0, errors: [] };
    for (const row of rows) {
      try {
        const student = await StudentAccountRepository.findByStudentCode(row.student_code);
        if (!student) throw new Error(`Không tìm thấy học sinh mã ${row.student_code}`);
        await this.assign(classAcademicYearId, student._id);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row, message: err.message });
      }
    }
    return results;
  }
}