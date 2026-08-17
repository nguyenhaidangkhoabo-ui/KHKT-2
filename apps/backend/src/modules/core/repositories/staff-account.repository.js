import { StaffAccount } from '../entities/staff-account.entity.js';

export class StaffAccountRepository {
  static async findByUsername(username) {
    return await StaffAccount.findOne({ username });
  }

  static async findById(id) {
    return await StaffAccount.findById(id).select('-password_hash');
  }

  static async create(data) {
    return await StaffAccount.create(data);
  }

  static async update(id, data) {
    return await StaffAccount.findByIdAndUpdate(id, data, { new: true }).select('-password_hash');
  }
}
