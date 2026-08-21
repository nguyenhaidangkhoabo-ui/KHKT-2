import mongoose from 'mongoose';
import { DayOfWeek } from '../enums.js';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;


const scheduleDaySchema = new mongoose.Schema(
  {
    day_of_week: { type: String, enum: Object.values(DayOfWeek), required: true },
    enabled: { type: Boolean, default: true },
    start_time: { type: String, default: '07:30', match: TIME_REGEX },
    end_time: { type: String, default: '17:00', match: TIME_REGEX },
    capacity: { type: Number, default: 100, min: 1 },
    
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
    
    year_week: { type: String, required: true, unique: true, trim: true },
    week_start_date: { type: Date, required: true }, 
    week_end_date: { type: Date, required: true },   
    days: { type: [scheduleDaySchema], default: [] }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'diploma_pickup_schedules'
  }
);

pickupScheduleSchema.index({ week_start_date: 1, week_end_date: 1 });

export const PickupSchedule = mongoose.model('PickupSchedule', pickupScheduleSchema);