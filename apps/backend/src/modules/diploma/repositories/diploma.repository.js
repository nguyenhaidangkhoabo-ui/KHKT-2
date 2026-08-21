import { Diploma } from '../entities/diploma.entity.js';

const STUDENT_POPULATE = { path: 'student_id', select: 'student_code full_name academic_status' };
const YEAR_POPULATE = { path: 'graduation_academic_year_id', select: 'name start_year end_year' };

export class DiplomaRepository {
  static async startSession() {
    return await Diploma.db.startSession();
  }

  static async findAll(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.year_id) query.graduation_academic_year_id = filters.year_id;
    if (filters.student_id) query.student_id = filters.student_id;
    if (filters.student_ids) query.student_id = { $in: filters.student_ids };
    return await Diploma.find(query)
      .populate(STUDENT_POPULATE)
      .populate(YEAR_POPULATE)
      .sort({ created_at: -1 });
  }

  static async findById(id) {
    return await Diploma.findById(id)
      .populate(STUDENT_POPULATE)
      .populate(YEAR_POPULATE);
  }

  static async findByStudentId(studentId) {
    return await Diploma.findOne({ student_id: studentId });
  }

  static async findByStudentIds(studentIds) {
    return await Diploma.find({ student_id: { $in: studentIds } });
  }

  static async findByIds(ids) {
    return await Diploma.find({ _id: { $in: ids } });
  }

  static async existsByStudentAndYear(studentId, graduationAcademicYearId) {
    return await Diploma.exists({ student_id: studentId, graduation_academic_year_id: graduationAcademicYearId });
  }

  static async create(data) {
    return await Diploma.create(data);
  }

  static async bulkCreate(datas) {
    
    return await Diploma.insertMany(datas, { ordered: false });
  }

  static async update(id, data) {
    return await Diploma.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  static async updateStatus(id, newStatus, extra = {}) {
    return await Diploma.findByIdAndUpdate(
      id,
      { $set: { status: newStatus, ...extra } },
      { new: true }
    );
  }

  static async bulkUpdateStatus(ids, fromStatus, toStatus, extra = {}) {
    
    return await Diploma.updateMany(
      { _id: { $in: ids }, status: fromStatus },
      { $set: { status: toStatus, ...extra } }
    );
  }

  static async countByStatus() {
    const result = await Diploma.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const counts = { NOT_STORED: 0, STORED: 0, HANDED_OVER: 0 };
    for (const item of result) {
      if (item._id) counts[item._id] = item.count;
    }
    return counts;
  }

  static async delete(id) {
    return await Diploma.findByIdAndDelete(id);
  }

    static async findByStudentIdPopulated(studentId) {
    return await Diploma.findOne({ student_id: studentId })
      .populate({ path: 'student_id', select: 'student_code full_name academic_status' })
      .populate({ path: 'graduation_academic_year_id', select: 'name start_year end_year' });
  }

  static async countAll() {
    return await Diploma.countDocuments();
  }
  
}

