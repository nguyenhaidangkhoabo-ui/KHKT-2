import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class TeacherService {
  
  static async getMyHomeroomClasses(staffId, academicYearId) {
    const all = await ClassAcademicYearRepository.findAll();
    if (!staffId) return all;
    return all.filter((c) => c.homeroom_staff_id?._id?.toString() === staffId.toString());
  }

  
  static async getClassStudents(classAcademicYearId) {
    const classAY = await ClassAcademicYearRepository.findById(classAcademicYearId);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return await StudentClassAcademicYearRepository.findStudentsByClassAcademicYear(classAcademicYearId);
  }
}