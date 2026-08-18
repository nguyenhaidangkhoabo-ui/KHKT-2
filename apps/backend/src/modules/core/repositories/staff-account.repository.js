import { StaffAccount } from '../entities/staff-account.entity.js';

export class StaffAccountRepository {
  static async findByUsername(username) {
    return await StaffAccount.findOne({ username });
  }

  static async findById(id) {
    return await StaffAccount.findById(id).select('-password_hash');
  }

  static async findByIdWithPassword(id) {
    return await StaffAccount.findById(id);
  }

  static async findAll(filters = {}) {
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;
    if (filters.keyword) {
      query.$or = [
        { full_name: { $regex: filters.keyword, $options: 'i' } },
        { staff_code: { $regex: filters.keyword, $options: 'i' } },
        { email: { $regex: filters.keyword, $options: 'i' } }
      ];
    }
    return await StaffAccount.find(query).select('-password_hash').sort({ created_at: -1 });
  }

  static async create(data) {
    return await StaffAccount.create(data);
  }

  static async update(id, data) {
    return await StaffAccount.findByIdAndUpdate(id, data, { new: true }).select('-password_hash');
  }

  static async updateStatus(id, status) {
    return await StaffAccount.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).select('-password_hash');
  }

  static async updateRole(id, role) {
    return await StaffAccount.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select('-password_hash');
  }

  static async delete(id) {
    return await StaffAccount.findByIdAndDelete(id);
  }
}