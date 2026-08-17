import bcrypt from 'bcrypt';
import { StaffAccountRepository } from '../repositories/staff-account.repository.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';
import { TokenService } from './token.service.js';
import { UserStatus } from '../enums.js';

export class AuthenService {
  static async login(username, password) {
    // Check in staff_accounts first
    let user = await StaffAccountRepository.findByUsername(username);
    let isStaff = true;

    if (!user) {
      // If not staff, check in student_accounts
      user = await StudentAccountRepository.findByUsername(username);
      isStaff = false;
    }

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    if (user.status === UserStatus.DISABLED) {
      throw new Error('Tài khoản đã bị khóa.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    const payload = {
      sub: user._id,
      username: user.username,
      role: user.role,
      is_staff: isStaff
    };

    const token = TokenService.generateToken(payload);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email
      }
    };
  }
}
