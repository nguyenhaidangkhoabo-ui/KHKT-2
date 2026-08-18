import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class TeacherService {
  // TCH-01: GVCN xem danh sách lớp chủ nhiệm của mình
  static async getMyHomeroomClasses(staffId, academicYearId) {
    const all = await ClassAcademicYearRepository.findAll();
    return all.filter((c) => c.homeroom_staff_id?._id?.toString() === staffId.toString());
  }

  // TCH-03: GVCN xem danh sách học sinh lớp mình chủ nhiệm
  static async getClassStudents(classAcademicYearId, staffId) {
    const classAY = await ClassAcademicYearRepository.findById(classAcademicYearId);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (classAY.homeroom_staff_id?._id?.toString() !== staffId.toString()) {
      throw new AppError('Bạn không phải GVCN của lớp này.', HttpStatus.FORBIDDEN, ErrorCode.UNAUTHENTICATED);
    }
    return await StudentClassAcademicYearRepository.findStudentsByClassAcademicYear(classAcademicYearId);
  }
}