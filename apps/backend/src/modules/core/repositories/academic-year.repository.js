import { AcademicYear } from '../entities/academic-year.entity.js';

export class AcademicYearRepository {
  static async findCurrent() {
    return await AcademicYear.findOne({ is_current: true });
  }

  static async findAll() {
    return await AcademicYear.find().sort({ start_year: -1 });
  }

  static async create(data) {
    return await AcademicYear.create(data);
  }

  static async findById(id) {
    return await AcademicYear.findById(id);
  }
}
