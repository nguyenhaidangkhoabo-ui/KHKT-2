import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { AcademicYearRepository } from '../repositories/academic-year.repository.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ClassYearService {
  static async getAll() {
    const classYears = await ClassAcademicYearRepository.findAll();
    const counts = await StudentClassAcademicYearRepository.countByClassAcademicYearIds(
      classYears.map((classYear) => classYear._id)
    );

    return classYears.map((classYear) => ({
      ...classYear.toObject(),
      student_count: counts.get(String(classYear._id)) || 0
    }));
  }

  // Xếp hàng loạt học sinh chưa có lớp trong năm học vào các lớp có sỉ số thấp nhất.
  static async autoAssignStudents(academicYearId) {
    const academicYear = await AcademicYearRepository.findById(academicYearId);
    if (!academicYear) {
      throw new AppError('Không tìm thấy năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const classYears = await ClassAcademicYearRepository.findByAcademicYear(academicYearId);
    if (classYears.length === 0) {
      return { assigned: 0, unassigned_before: 0, classes: [] };
    }

    const classYearIds = classYears.map((classYear) => classYear._id);
    const links = await StudentClassAcademicYearRepository.findLinksByClassAcademicYearIds(
      classYearIds
    );
    const assignedStudentIds = [...new Set(links.map((link) => String(link.student_id)))];

    // Chỉ xếp học sinh đang học và chưa thuộc lớp nào trong năm học này.
    const students = await StudentAccountRepository.findActiveExcludingIds(assignedStudentIds);

    // Khởi tạo sỉ số hiện tại của từng lớp.
    const counts = new Map(classYearIds.map((id) => [String(id), 0]));
    links.forEach((link) => {
      const key = String(link.class_academic_year_id);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    // Thứ tự lớp cố định để kết quả ổn định khi sỉ số bằng nhau.
    const classOrder = [...classYears].sort((a, b) =>
      (a.class_id?.name || '').localeCompare(b.class_id?.name || '', 'vi')
    );

    const newLinks = [];
    const addedByClass = new Map();

    for (const student of students) {
      let target = classOrder[0];
      let lowest = counts.get(String(target._id)) || 0;

      for (const classYear of classOrder.slice(1)) {
        const count = counts.get(String(classYear._id)) || 0;
        if (count < lowest) {
          target = classYear;
          lowest = count;
        }
      }

      const targetId = String(target._id);
      counts.set(targetId, (counts.get(targetId) || 0) + 1);
      addedByClass.set(targetId, (addedByClass.get(targetId) || 0) + 1);
      newLinks.push({
        class_academic_year_id: target._id,
        student_id: student._id
      });
    }

    await StudentClassAcademicYearRepository.bulkAddStudentLinks(newLinks);

    return {
      assigned: newLinks.length,
      unassigned_before: students.length,
      classes: classOrder
        .map((classYear) => ({
          class_academic_year_id: classYear._id,
          class_name: classYear.class_id?.name || '',
          added: addedByClass.get(String(classYear._id)) || 0,
          student_count: counts.get(String(classYear._id)) || 0
        }))
        .filter((classYear) => classYear.added > 0)
    };
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