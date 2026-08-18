import { PickupRegistration } from '../entities/pickup-registration.entity.js';
import { RegistrationStatus } from '../enums.js';

const STUDENT_POPULATE = { path: 'student_id', select: 'student_code full_name phone' };
const DIPLOMA_POPULATE = { path: 'diploma_id', select: 'diploma_number status' };
const SCHEDULE_POPULATE = { path: 'schedule_id', select: 'year_week week_start_date week_end_date' };

export class PickupRegistrationRepository {
  static async startSession() {
    return await PickupRegistration.db.startSession();
  }

  static async findById(id) {
    return await PickupRegistration.findById(id)
      .populate(STUDENT_POPULATE)
      .populate(DIPLOMA_POPULATE)
      .populate(SCHEDULE_POPULATE);
  }

  // Các đăng ký TƯƠNG LAI của học sinh (chưa hủy)
  static async findFutureByStudent(studentId, todayStr) {
    return await PickupRegistration.find({
      student_id: studentId,
      pickup_date: { $gte: todayStr },
      status: { $ne: RegistrationStatus.CANCELLED }
    })
      .sort({ pickup_date: 1 })
      .populate(SCHEDULE_POPULATE)
      .populate(DIPLOMA_POPULATE);
  }

  // 1 đăng ký tương lai gần nhất (kiểm tra REG-07: chỉ 1 đăng ký tương lai)
  static async findUpcomingForStudent(studentId, todayStr) {
    return await PickupRegistration.findOne({
      student_id: studentId,
      pickup_date: { $gte: todayStr },
      status: { $ne: RegistrationStatus.CANCELLED }
    });
  }

  // Lịch sử: quá khứ hoặc đã hoàn thành/hủy
  static async findHistoryByStudent(studentId, todayStr) {
    return await PickupRegistration.find({
      student_id: studentId,
      $or: [
        { pickup_date: { $lt: todayStr } },
        { status: { $in: [RegistrationStatus.COMPLETED, RegistrationStatus.CANCELLED] } }
      ]
    })
      .sort({ pickup_date: -1, created_at: -1 })
      .populate(SCHEDULE_POPULATE)
      .populate(DIPLOMA_POPULATE);
  }

  // Danh sách phân trang cho BGH/ADMIN
  static async findList({ pickup_date, student_id, page = 1, limit = 20 }) {
    const query = {};
    if (pickup_date) query.pickup_date = pickup_date;
    if (student_id) query.student_id = student_id;

    const total = await PickupRegistration.countDocuments(query);
    const rows = await PickupRegistration.find(query)
      .sort({ pickup_date: -1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(STUDENT_POPULATE)
      .populate(DIPLOMA_POPULATE)
      .populate(SCHEDULE_POPULATE);

    return {
      rows,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit) || 1
    };
  }

  // Danh sách đăng ký theo ngày (dùng cho by-date & export)
  static async findByDate(pickupDate) {
    return await PickupRegistration.find({ pickup_date: pickupDate })
      .sort({ created_at: 1 })
      .populate(STUDENT_POPULATE)
      .populate(DIPLOMA_POPULATE)
      .populate(SCHEDULE_POPULATE);
  }

  static async create(data, session) {
    if (session) {
      const [doc] = await PickupRegistration.create([data], { session });
      return doc;
    }
    return await PickupRegistration.create(data);
  }

  static async updateStatus(id, status, session) {
    const opts = session ? { session, new: true } : { new: true };
    return await PickupRegistration.findByIdAndUpdate(
      id,
      { $set: { status } },
      opts
    );
  }

  // Đánh dấu hoàn thành tất cả đăng ký của học sinh (khi trao bằng)
  static async markCompletedByStudent(studentId, session) {
    const opts = session ? { session } : {};
    return await PickupRegistration.updateMany(
      { student_id: studentId, status: { $ne: RegistrationStatus.COMPLETED } },
      { $set: { status: RegistrationStatus.COMPLETED } },
      opts
    );
  }

  static async countByStatus() {
    const result = await PickupRegistration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const counts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const item of result) {
      if (item._id) counts[item._id] = item.count;
    }
    return counts;
  }

    // Đánh dấu hoàn thành đăng ký cho nhiều học sinh (khi bulk-handover)
  static async markCompletedByStudentMany(studentIds, session) {
    const opts = session ? { session } : {};
    return await PickupRegistration.updateMany(
      { student_id: { $in: studentIds }, status: { $ne: RegistrationStatus.COMPLETED } },
      { $set: { status: RegistrationStatus.COMPLETED } },
      opts
    );
  }
}