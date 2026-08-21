import { AcademicYearRepository } from '../repositories/academic-year.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class AcademicYearService {
  static async getAll() {
    return await AcademicYearRepository.findAll();
  }

  static async getById(id) {
    const year = await AcademicYearRepository.findById(id);
    if (!year) throw new AppError('Không tìm thấy năm học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    return year;
  }

  static async getCurrent() {
    return await AcademicYearRepository.findCurrent();
  }

  static async create(data) {
    return await AcademicYearRepository.create(data);
  }

  static async update(id, data) {
    await this.getById(id);
    return await AcademicYearRepository.update(id, data);
  }

  static async delete(id) {
    const year = await this.getById(id);
    
    if (year.is_current) {
      throw new AppError('Không thể xóa năm học đang là năm hiện tại (AY-03).', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    return await AcademicYearRepository.delete(id);
  }

  
  static async setCurrentAcademicYear(yearId) {
    const session = await AcademicYearRepository.startSession();
    session.startTransaction();
    try {
      await AcademicYearRepository.clearCurrentFlag(session);
      const updated = await AcademicYearRepository.makeCurrent(yearId, session);
      await session.commitTransaction();
      session.endSession();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}