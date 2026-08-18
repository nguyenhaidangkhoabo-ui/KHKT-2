import { ClassService } from '../services/class.service.js';
import { validateClassInput } from '../dto/class.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ClassController {
  static async getAll(req, res, next) {
    try {
      const classes = await ClassService.getAll();
      return res.status(HttpStatus.OK).json({ success: true, data: classes });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const classData = await ClassService.getById(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data: classData });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const validation = validateClassInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const created = await ClassService.create(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: created });
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const updated = await ClassService.update(req.params.id, req.body);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await ClassService.delete(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Xóa lớp học thành công' });
    } catch (err) { next(err); }
  }
}