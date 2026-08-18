import { ClassModel } from '../entities/class.entity.js';

export class ClassRepository {
  static async findAll() {
    return await ClassModel.find().sort({ name: 1 });
  }

  static async findByName(name) {
    return await ClassModel.findOne({ name });
  }

  static async findById(id) {
    return await ClassModel.findById(id);
  }

  static async create(data) {
    return await ClassModel.create(data);
  }

  static async update(id, data) {
    return await ClassModel.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await ClassModel.findByIdAndDelete(id);
  }
}