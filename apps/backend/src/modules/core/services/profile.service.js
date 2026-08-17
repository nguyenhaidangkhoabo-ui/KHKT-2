import { StaffAccountRepository } from '../repositories/staff-account.repository.js';
import { StudentAccountRepository } from '../repositories/student-account.repository.js';

export class ProfileService {
  static async getProfile(userId, isStaff) {
    if (isStaff) {
      return await StaffAccountRepository.findById(userId);
    } else {
      return await StudentAccountRepository.findById(userId);
    }
  }
}
