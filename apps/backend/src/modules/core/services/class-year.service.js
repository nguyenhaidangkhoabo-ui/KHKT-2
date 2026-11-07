import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ClassYearService {
  static async getAll() {
    return await ClassAcademicYearRepository.findAll();
  }

  static async getById(id) {
    const classAY = await ClassAcademicYearRepository.findById(id);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return classAY;
  }

  static async create(data) {
    const existing = await ClassAcademicYearRepository.findByAcademicYearAndClass(
      data.academic_year_id,
      data.class_id
    );
    if (existing) {
      throw new AppError('Lớp này đã tồn tại trong năm học.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    return await ClassAcademicYearRepository.create(data);
  }

  static async assignHomeroomTeacher(classAcademicYearId, staffId) {
    const classAY = await ClassAcademicYearRepository.findById(classAcademicYearId);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Một giáo viên chỉ chủ nhiệm một lớp trong cùng một năm học.
    if (staffId) {
      const academicYearId = classAY.academic_year_id?._id || classAY.academic_year_id;
      const conflict = await ClassAcademicYearRepository.findByAcademicYearAndHomeroom(
        academicYearId,
        staffId
      );
      if (conflict && String(conflict._id) !== String(classAcademicYearId)) {
        throw new AppError(
          `Giáo viên đã chủ nhiệm lớp ${conflict.class_id?.name || 'khác'} trong năm học này.`,
          HttpStatus.CONFLICT,
          ErrorCode.VALIDATION_ERROR
        );
      }
    }

    // staffId rỗng/null = hủy phân công.
    return await ClassAcademicYearRepository.assignHomeroomTeacher(
      classAcademicYearId,
      staffId || null
    );
  }

  static async delete(id) {
    const classAY = await ClassAcademicYearRepository.findById(id);
    if (!classAY) {
      throw new AppError('Không tìm thấy lớp-năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    
    const students = await StudentClassAcademicYearRepository.findStudentsByClassAcademicYear(id);
    if (students.length > 0) {
      throw new AppError('Không thể xóa lớp-năm học đã có học sinh.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    return await ClassAcademicYearRepository.delete(id);
  }
}