import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';
import { StudentClassAcademicYearRepository } from '../repositories/student-class-academic-year.repository.js';
import { AcademicYearRepository } from '../repositories/academic-year.repository.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ClassYearService {
  static async getAll() {
    const list = await ClassAcademicYearRepository.findAll();
    const ids = (list || []).map((item) => item._id);
    const counts = await StudentClassAcademicYearRepository.countByClassAcademicYearIds(ids);
    return (list || []).map((item) => {
      const obj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
      obj.student_count = counts.get(String(item._id)) ?? 0;
      return obj;
    });
  }

  // Xếp học sinh Đang học chưa có lớp trong năm vào lớp có sỉ số thấp nhất (khớp khối).
  static async autoAssignStudents(academicYearId) {
    const year = await AcademicYearRepository.findById(academicYearId);
    if (!year) {
      throw new AppError('Không tìm thấy năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    const all = await ClassAcademicYearRepository.findAll();
    const classAYs = (all || []).filter(
      (item) => String(item.academic_year_id?._id || item.academic_year_id) === String(academicYearId)
    );
    if (!classAYs.length) {
      throw new AppError('Năm học chưa có lớp nào.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const ids = classAYs.map((item) => item._id);
    const counts = await StudentClassAcademicYearRepository.countByClassAcademicYearIds(ids);
    const assignedIds = await StudentClassAcademicYearRepository.findStudentIdsByClassAcademicYearIds(ids);
    const assignedSet = new Set((assignedIds || []).map(String));

    const active = await StudentAccountRepository.findAll({ academic_status: 'ACTIVE' });
    // Xử lý theo student_code tăng dần; loại học sinh đã có lớp trong năm.
    const candidates = (active || [])
      .filter((s) => !assignedSet.has(String(s._id)))
      .sort((a, b) => String(a.student_code || '').localeCompare(String(b.student_code || '')));

    const startYear = year.start_year;
    // Nhóm lớp theo khối (grade nằm ở class_id).
    const byGrade = new Map();
    for (const item of classAYs) {
      const grade = item.class_id?.grade;
      if (!grade) continue;
      if (!byGrade.has(grade)) byGrade.set(grade, []);
      byGrade.get(grade).push({
        id: item._id,
        name: item.class_id?.name || '',
        count: counts.get(String(item._id)) ?? 0,
      });
    }
    for (const [, group] of byGrade) {
      group.sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi'));
    }

    const docs = [];
    const addedByClass = new Map();
    let skippedNoClass = 0;
    for (const student of candidates) {
      const grade = `GRADE_${10 + (startYear - student.enrollment_year)}`;
      const group = byGrade.get(grade);
      if (!group || !group.length) {
        skippedNoClass++;
        continue;
      }
      // Chọn lớp có sỉ số thấp nhất, hoà thì tên lớp A-Z (nhóm đã sắp xếp A-Z).
      let target = group[0];
      for (const g of group) {
        if (g.count < target.count) target = g;
      }
      docs.push({ class_academic_year_id: target.id, student_id: student._id });
      target.count++;
      addedByClass.set(target.name, (addedByClass.get(target.name) || 0) + 1);
    }

    let assigned = 0;
    let unassignedCount = skippedNoClass;
    if (docs.length) {
      try {
        const inserted = await StudentClassAcademicYearRepository.bulkAddLinks(docs);
        assigned = inserted.length;
      } catch (err) {
        const insertedCount = err?.insertedDocs?.length ?? 0;
        assigned = insertedCount;
        unassignedCount += docs.length - insertedCount;
      }
    }

    return {
      assigned,
      unassigned: unassignedCount,
      skipped_no_class: skippedNoClass,
      by_class: [...addedByClass.entries()].map(([class_name, added]) => ({ class_name, added })),
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