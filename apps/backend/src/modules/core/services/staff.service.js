import bcrypt from 'bcrypt';
import { StaffAccountRepository } from '../repositories/staff-account.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class StaffService {
  static async getAll(filters = {}) {
    return await StaffAccountRepository.findAll(filters);
  }

  static async getById(id) {
    const staff = await StaffAccountRepository.findById(id);
    if (!staff) {
      throw new AppError('Không tìm thấy nhân viên.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return staff;
  }

  static async create(data) {
    const existing = await StaffAccountRepository.findByUsername(data.username);
    if (existing) {
      throw new AppError('Tên đăng nhập đã tồn tại.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    return await StaffAccountRepository.create({ ...data, password_hash: passwordHash });
  }

  static async update(id, data) {
    await this.getById(id);
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    return await StaffAccountRepository.update(id, data);
  }

  static async updateStatus(id, status) {
    await this.getById(id);
    return await StaffAccountRepository.updateStatus(id, status);
  }

  static async updateRole(id, role) {
    await this.getById(id);
    return await StaffAccountRepository.updateRole(id, role);
  }

  static async delete(id) {
    await this.getById(id);
    return await StaffAccountRepository.delete(id);
  }

  static async importFromExcel(rows) {
    const results = { success: 0, failed: 0, errors: [] };
    for (const row of rows) {
      try {
        await this.create(row);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row, message: err.message });
      }
    }
    return results;
  }
}