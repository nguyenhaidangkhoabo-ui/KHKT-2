import { StudentAccount } from '../entities/student-account.entity.js';

export class StudentAccountRepository {
  static async findByUsername(username) {
    return await StudentAccount.findOne({ username });
  }

  static async findByStudentCode(studentCode) {
    return await StudentAccount.findOne({ student_code: studentCode }).select('-password_hash');
  }

  static async findById(id) {
    return await StudentAccount.findById(id).select('-password_hash');
  }

  static async create(data) {
    return await StudentAccount.create(data);
  }

  static async updateStatus(id, newStatus) {
    return await StudentAccount.findByIdAndUpdate(
      id,
      { $set: { academic_status: newStatus } },
      { new: true }
    ).select('-password_hash');
  }
}
