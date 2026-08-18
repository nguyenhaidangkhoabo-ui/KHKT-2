import { ClassAcademicYear } from '../entities/class-academic-year.entity.js';

export class ClassAcademicYearRepository {
  static async findAll() {
    return await ClassAcademicYear.find()
      .populate('academic_year_id')
      .populate('class_id')
      .populate('homeroom_staff_id', '-password_hash');
  }

  static async findByAcademicYearAndClass(academicYearId, classId) {
    return await ClassAcademicYear.findOne({
      academic_year_id: academicYearId,
      class_id: classId
    });
  }

  static async findById(id) {
    return await ClassAcademicYear.findById(id)
      .populate('academic_year_id')
      .populate('class_id')
      .populate('homeroom_staff_id', '-password_hash');
  }

  static async create(data) {
    return await ClassAcademicYear.create(data);
  }

  static async assignHomeroomTeacher(classAcademicYearId, staffId) {
    return await ClassAcademicYear.findByIdAndUpdate(
      classAcademicYearId,
      { $set: { homeroom_staff_id: staffId } },
      { new: true }
    );
  }

  static async delete(id) {
    return await ClassAcademicYear.findByIdAndDelete(id);
  }
}