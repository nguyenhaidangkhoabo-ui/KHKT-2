import { StudentClassAcademicYear } from '../entities/student-class-academic-year.entity.js';
import { ClassAcademicYear } from '../entities/class-academic-year.entity.js';

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

  // Đếm sỉ số theo từng lớp-năm học. Trả về Map<classAcademicYearId, count>.
  static async countByClassAcademicYearIds(ids) {
    const result = new Map();
    const list = (ids || []).map(String);
    if (!list.length) return result;
    const rows = await StudentClassAcademicYear.aggregate([
      { $match: { class_academic_year_id: { $in: ids } } },
      { $group: { _id: '$class_academic_year_id', count: { $sum: 1 } } }
    ]);
    for (const row of rows) {
      result.set(String(row._id), row.count);
    }
    for (const id of list) {
      if (!result.has(id)) result.set(id, 0);
    }
    return result;
  }

  // Lấy id học sinh đã có lớp trong một nhóm lớp-năm học.
  static async findStudentIdsByClassAcademicYearIds(ids) {
    if (!ids || !ids.length) return [];
    const rows = await StudentClassAcademicYear.find({
      class_academic_year_id: { $in: ids }
    })
      .select('student_id')
      .lean();
    return rows.map((r) => String(r.student_id));
  }

  // Ghi nhiều liên kết học sinh-lớp (insertMany, bỏ qua lỗi trùng).
  static async bulkAddLinks(docs) {
    if (!docs || !docs.length) return [];
    return await StudentClassAcademicYear.insertMany(docs, { ordered: false });
  }

  // Lớp hiện tại của từng học sinh trong một năm học (dùng cho danh sách học sinh).
  // Trả về Map<studentId, classDocument>.
  static async findCurrentClassByStudentIds(studentIds, academicYearId) {
    if (!studentIds.length) return new Map();

    const classAcademicYears = await ClassAcademicYear.find({ academic_year_id: academicYearId })
      .populate('class_id');
    const classById = new Map(
      classAcademicYears.map((classAY) => [String(classAY._id), classAY.class_id])
    );
    if (classById.size === 0) return new Map();

    const links = await StudentClassAcademicYear.find({
      student_id: { $in: studentIds },
      class_academic_year_id: { $in: classAcademicYears.map((classAY) => classAY._id) }
    });

    const result = new Map();
    for (const link of links) {
      const classDoc = classById.get(String(link.class_academic_year_id));
      if (classDoc) result.set(String(link.student_id), classDoc);
    }
    return result;
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