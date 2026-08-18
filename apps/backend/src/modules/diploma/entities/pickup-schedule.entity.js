import mongoose from 'mongoose';
import { DayOfWeek } from '../enums.js';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Một ngày trong tuần của lịch phát bằng
const scheduleDaySchema = new mongoose.Schema(
  {
    day_of_week: { type: String, enum: Object.values(DayOfWeek), required: true },
    enabled: { type: Boolean, default: true },
    start_time: { type: String, default: '07:30', match: TIME_REGEX },
    end_time: { type: String, default: '17:00', match: TIME_REGEX },
    capacity: { type: Number, default: 100, min: 1 },
    // Số lượt đã đăng ký trong ngày (tăng/giảm atomic khi đăng ký/hủy)
    registered_count: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const pickupScheduleSchema = new mongoose.Schema(
  {
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true
    },
    // Tuần theo chuẩn ISO, ví dụ: 2026-W32 (SCH-01: mỗi tuần chỉ có 1 lịch)
    year_week: { type: String, required: true, unique: true, trim: true },
    week_start_date: { type: Date, required: true }, // Thứ 2
    week_end_date: { type: Date, required: true },   // Chủ nhật
    days: { type: [scheduleDaySchema], default: [] }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'diploma_pickup_schedules'
  }
);

pickupScheduleSchema.index({ week_start_date: 1, week_end_date: 1 });

export const PickupSchedule = mongoose.model('PickupSchedule', pickupScheduleSchema);