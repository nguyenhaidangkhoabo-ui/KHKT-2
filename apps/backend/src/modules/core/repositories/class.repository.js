import { ClassModel } from '../entities/class.entity.js';

export class ClassRepository {
  static async findAll() {
    return await ClassModel.find().sort({ name: 1 });
  }

  static async findByName(name) {
    return await ClassModel.findOne({ name });
  }

  static async create(data) {
    return await ClassModel.create(data);
  }
}
