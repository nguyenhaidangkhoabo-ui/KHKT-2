import mongoose from 'mongoose';
import { Grade } from '../enums.js';

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    grade: { type: String, enum: Object.values(Grade), required: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'classes'
  }
);

export const ClassModel = mongoose.model('Class', classSchema);
