import { ClassRepository } from '../repositories/class.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ClassService {
  static async getAll(filters = {}) {
    return await ClassRepository.findAll();
  }

  static async getById(id) {
    const classData = await ClassRepository.findById(id);
    if (!classData) {
      throw new AppError('Không tìm thấy lớp học.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return classData;
  }

  static async create(data) {
    const existing = await ClassRepository.findByName(data.name);
    if (existing) {
      throw new AppError('Tên lớp đã tồn tại.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    return await ClassRepository.create(data);
  }

  static async update(id, data) {
    await this.getById(id);
    if (data.name) {
      const existing = await ClassRepository.findByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw new AppError('Tên lớp đã tồn tại.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
      }
    }
    return await ClassRepository.update(id, data);
  }

  static async delete(id) {
    await this.getById(id);
    return await ClassRepository.delete(id);
  }
}