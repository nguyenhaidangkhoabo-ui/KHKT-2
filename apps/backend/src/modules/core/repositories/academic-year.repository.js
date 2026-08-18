import { AcademicYear } from '../entities/academic-year.entity.js';

export class AcademicYearRepository {
  static async startSession() {
    return await AcademicYear.startSession();
  }

  static async findCurrent() {
    return await AcademicYear.findOne({ is_current: true });
  }

  static async findAll() {
    return await AcademicYear.find().sort({ start_year: -1 });
  }

  static async findById(id) {
    return await AcademicYear.findById(id);
  }

  static async create(data) {
    return await AcademicYear.create(data);
  }

  static async update(id, data) {
    return await AcademicYear.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await AcademicYear.findByIdAndDelete(id);
  }

  static async clearCurrentFlag(session) {
    return await AcademicYear.updateMany({}, { $set: { is_current: false } }, { session });
  }

  static async makeCurrent(id, session) {
    return await AcademicYear.findByIdAndUpdate(
      id,
      { $set: { is_current: true } },
      { new: true, session }
    );
  }
}