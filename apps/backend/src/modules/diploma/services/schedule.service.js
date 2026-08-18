import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import { AcademicYear } from '../../core/entities/index.js';
import { DayOfWeek, DAY_NAMES } from '../enums.js';
import { PickupScheduleRepository } from '../repositories/pickup-schedule.repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// ---- Hàm hỗ trợ tuần (chuẩn ISO) ----
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Chủ nhật ... 6=Thứ 7
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getISOWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day); // dời về thứ 5 của tuần
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - yearStart) / DAY_MS) + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function dateToISOString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class ScheduleService {
  // Thông tin tuần hiện tại
  static weekInfo(date = new Date()) {
    const weekStart = getMonday(date);
    const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
    return {
      yearWeek: getISOWeek(weekStart),
      weekStart,
      weekEnd,
      weekStartISO: dateToISOString(weekStart),
      weekEndISO: dateToISOString(weekEnd)
    };
  }

  // Thông tin tuần sau (chỉ tuần sau mới được chỉnh sửa — SCH-04)
  static nextWeekInfo(date = new Date()) {
    const weekStart = getMonday(date);
    weekStart.setDate(weekStart.getDate() + 7);
    const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
    return {
      yearWeek: getISOWeek(weekStart),
      weekStart,
      weekEnd,
      weekStartISO: dateToISOString(weekStart),
      weekEndISO: dateToISOString(weekEnd)
    };
  }

  // GET /schedules/current-week
  static async getCurrentWeek() {
    const info = this.weekInfo();
    const schedule = await PickupScheduleRepository.findByYearWeek(info.yearWeek);
    if (!schedule) {
      throw new AppError('Chưa có lịch phát bằng cho tuần hiện tại.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return schedule;
  }

  // GET /schedules/next-week
  static async getNextWeek() {
    const info = this.nextWeekInfo();
    const schedule = await PickupScheduleRepository.findByYearWeek(info.yearWeek);
    if (!schedule) {
      throw new AppError('Chưa có lịch phát bằng cho tuần sau.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return schedule;
  }

  // GET /schedules — danh sách lịch
  static async getList(filters = {}) {
    if (filters.year_week) {
      const schedule = await PickupScheduleRepository.findByYearWeek(filters.year_week);
      return schedule ? [schedule] : [];
    }
    if (filters.year_id) {
      return await PickupScheduleRepository.findByYear(filters.year_id);
    }
    return await PickupScheduleRepository.findAll();
  }

  // POST /schedules/next-week/generate — tạo lịch tuần sau (mặc định T2–T6, 07:30–17:00, capacity 100)
  static async generateNextWeek() {
    const info = this.nextWeekInfo();

    const existing = await PickupScheduleRepository.findByYearWeek(info.yearWeek);
    if (existing) {
      throw new AppError('Lịch phát bằng tuần sau đã tồn tại.', HttpStatus.CONFLICT, ErrorCode.VALIDATION_ERROR);
    }

    // Năm học hiện tại (cờ is_current) — fallback năm gần nhất
    let academicYear = await AcademicYear.findOne({ is_current: true });
    if (!academicYear) {
      academicYear = await AcademicYear.findOne().sort({ start_year: -1 });
    }

    const days = DAY_NAMES.map((name) => ({
      day_of_week: name,
      enabled: name !== DayOfWeek.SATURDAY && name !== DayOfWeek.SUNDAY,
      start_time: '07:30',
      end_time: '17:00',
      capacity: 100,
      registered_count: 0
    }));

    return await PickupScheduleRepository.create({
      academic_year_id: academicYear?._id,
      year_week: info.yearWeek,
      week_start_date: info.weekStart,
      week_end_date: info.weekEnd,
      days
    });
  }

  // PATCH /schedules/next-week/days/:dayOfWeek — chỉnh 1 ngày của lịch tuần sau
  static async patchDay(dayOfWeek, patch) {
    if (!Object.values(DayOfWeek).includes(dayOfWeek)) {
      throw new AppError('Ngày trong tuần không hợp lệ.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const info = this.nextWeekInfo();
    const schedule = await PickupScheduleRepository.findByYearWeek(info.yearWeek);
    if (!schedule) {
      throw new AppError('Chưa có lịch phát bằng tuần sau. Hãy tạo lịch trước khi chỉnh sửa.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const day = schedule.days.find((d) => d.day_of_week === dayOfWeek);
    if (!day) {
      throw new AppError('Ngày này không tồn tại trong lịch tuần sau.', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // SCH: không được tắt ngày / giảm capacity dưới số đã đăng ký → SCHEDULE_CONFLICT
    const wouldDisable = patch.enabled === false;
    const wouldShrink = patch.capacity != null && patch.capacity < day.registered_count;
    if (wouldDisable || wouldShrink) {
      throw new AppError(
        `Không thể cập nhật vì ngày này đã có ${day.registered_count} lượt đăng ký nhận bằng.`,
        HttpStatus.CONFLICT,
        ErrorCode.SCHEDULE_CONFLICT
      );
    }

    return await PickupScheduleRepository.updateDay(schedule._id, dayOfWeek, patch);
  }

  // GET /schedules/available-dates — các ngày học sinh có thể đăng ký
  static async getAvailableDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = dateToISOString(today);

    const schedules = await PickupScheduleRepository.findFromDate(today);
    const result = [];

    for (const schedule of schedules) {
      const weekStart = new Date(schedule.week_start_date);
      for (const day of schedule.days) {
        if (!day.enabled) continue;

        const dayIndex = DAY_NAMES.indexOf(day.day_of_week);
        const date = new Date(weekStart.getTime() + dayIndex * DAY_MS);
        const dateStr = dateToISOString(date);

        if (dateStr < todayStr) continue;          // bỏ ngày đã qua
        if (day.registered_count >= day.capacity) continue; // ngày đã đủ

        result.push({
          _id: String(schedule._id),
          date: dateStr,
          day_of_week: day.day_of_week,
          shift_name: `${day.start_time} - ${day.end_time}`,
          note: '',
          remaining_slots: Math.max(0, day.capacity - day.registered_count)
        });
      }
    }

    return result;
  }
}