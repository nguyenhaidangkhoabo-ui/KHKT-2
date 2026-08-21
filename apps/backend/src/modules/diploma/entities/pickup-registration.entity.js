import mongoose from 'mongoose';
import { RegistrationStatus } from '../enums.js';

const pickupRegistrationSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentAccount',
      required: true
    },
    diploma_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diploma',
      required: true
    },
    schedule_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupSchedule',
      required: true
    },
    
    pickup_date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.PENDING
    },
    note: { type: String, trim: true, default: '' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'diploma_pickup_registrations'
  }
);


pickupRegistrationSchema.index({ schedule_id: 1, pickup_date: 1, student_id: 1 }, { unique: true });
pickupRegistrationSchema.index({ student_id: 1, pickup_date: 1 });
pickupRegistrationSchema.index({ pickup_date: 1 });

export const PickupRegistration = mongoose.model('PickupRegistration', pickupRegistrationSchema);