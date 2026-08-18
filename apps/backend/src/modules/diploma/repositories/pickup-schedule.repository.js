import { PickupSchedule } from '../entities/pickup-schedule.entity.js';

const YEAR_POPULATE = { path: 'academic_year_id', select: 'name start_year end_year' };

export class PickupScheduleRepository {
  static async findById(id) {
    return await PickupSchedule.findById(id).populate(YEAR_POPULATE);
  }

  static async findByIdForUpdate(id, session) {
    return await PickupSchedule.findById(id).session(session);
  }

  static async findByYearWeek(yearWeek) {
    return await PickupSchedule.findOne({ year_week: yearWeek }).populate(YEAR_POPULATE);
  }

  static async findByYear(yearId) {
    return await PickupSchedule.find({ academic_year_id: yearId })
      .sort({ week_start_date: 1 })
      .populate(YEAR_POPULATE);
  }

  // Lịch chứa ngày `date` (dựa vào khoảng tuần)
  static async findByDate(date) {
    return await PickupSchedule.findOne({
      week_start_date: { $lte: date },
      week_end_date: { $gte: date }
    });
  }

  // Các lịch từ ngày `fromDate` trở đi (dùng cho available-dates)
  static async findFromDate(fromDate) {
    return await PickupSchedule.find({ week_end_date: { $gte: fromDate } })
      .sort({ week_start_date: 1 });
  }

  static async create(data) {
    return await PickupSchedule.create(data);
  }

  static async update(id, data) {
    return await PickupSchedule.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // Cập nhật một ngày cụ thể trong mảng days
  static async updateDay(id, dayOfWeek, patch) {
    const setFields = {};
    if (patch.enabled !== undefined) setFields['days.$[elem].enabled'] = patch.enabled;
    if (patch.start_time !== undefined) setFields['days.$[elem].start_time'] = patch.start_time;
    if (patch.end_time !== undefined) setFields['days.$[elem].end_time'] = patch.end_time;
    if (patch.capacity !== undefined) setFields['days.$[elem].capacity'] = patch.capacity;
    return await PickupSchedule.findByIdAndUpdate(
      id,
      { $set: setFields },
      {
        arrayFilters: [{ 'elem.day_of_week': dayOfWeek }],
        new: true,
        runValidators: true
      }
    );
  }
  
  static async findAll() {
    return await PickupSchedule.find().sort({ week_start_date: -1 }).populate(YEAR_POPULATE);
  }
}