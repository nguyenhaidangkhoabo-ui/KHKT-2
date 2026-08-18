import bcrypt from 'bcrypt';
import { StaffAccountRepository } from '../repositories/staff-account.repository.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ProfileService {
  static async getProfile(userId, isStaff) {
    if (isStaff) {
      return await StaffAccountRepository.findById(userId);
    }
    return await StudentAccountRepository.findById(userId);
  }

  static async changePassword(userId, isStaff, oldPassword, newPassword) {
    const repo = isStaff ? StaffAccountRepository : StudentAccountRepository;
    const user = await repo.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      throw new AppError('Mật khẩu cũ không chính xác.', HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return await repo.update(userId, { password_hash: passwordHash });
  }
}