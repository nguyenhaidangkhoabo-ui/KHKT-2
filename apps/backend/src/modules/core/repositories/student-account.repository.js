import { StudentAccount } from '../entities/student-account.entity.js';
import { AcademicStatus } from '../enums.js';

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

  static async findByIdWithPassword(id) {
    return await StudentAccount.findById(id);
  }

  static async findAll(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.academic_status) query.academic_status = filters.academic_status;
    if (filters.gender) query.gender = filters.gender;
    if (filters.keyword) {
      query.$or = [
        { full_name: { $regex: filters.keyword, $options: 'i' } },
        { student_code: { $regex: filters.keyword, $options: 'i' } },
        { email: { $regex: filters.keyword, $options: 'i' } }
      ];
    }
    return await StudentAccount.find(query).select('-password_hash').sort({ created_at: -1 });
  }

  static async findGraduated() {
    return await StudentAccount.find({ academic_status: AcademicStatus.GRADUATED })
      .select('-password_hash')
      .sort({ full_name: 1 });
  }

  static async create(data) {
    return await StudentAccount.create(data);
  }

  static async update(id, data) {
    return await StudentAccount.findByIdAndUpdate(id, data, { new: true }).select('-password_hash');
  }

  static async updateStatus(id, newStatus) {
    return await StudentAccount.findByIdAndUpdate(
      id,
      { $set: { academic_status: newStatus } },
      { new: true }
    ).select('-password_hash');
  }

  static async bulkUpdateStatus(ids, newStatus) {
    return await StudentAccount.updateMany(
      { _id: { $in: ids } },
      { $set: { academic_status: newStatus } }
    );
  }

  static async delete(id) {
    return await StudentAccount.findByIdAndDelete(id);
  }
}