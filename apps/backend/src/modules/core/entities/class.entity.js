import mongoose from 'mongoose';
import { GradeType } from '../enums.js';

const { Schema } = mongoose;

const ClassSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    grade: {
      type: String,
      enum: Object.values(GradeType),
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ClassSchema.index({ name: 1 }, { unique: true, name: 'uk_class_name' });

export const Class = mongoose.model('Class', ClassSchema, 'classes');
