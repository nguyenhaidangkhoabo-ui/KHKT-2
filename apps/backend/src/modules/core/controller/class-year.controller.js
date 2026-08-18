import { ClassYearService } from '../services/class-year.service.js';
import { validateClassYearInput, validateHomeroomAssignmentInput } from '../dto/class-year.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ClassYearController {
  static async getAll(req, res, next) {
    try {
      const list = await ClassYearService.getAll();
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const classAY = await ClassYearService.getById(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data: classAY });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const validation = validateClassYearInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const created = await ClassYearService.create(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: created });
    } catch (err) { next(err); }
  }

  static async assignHomeroom(req, res, next) {
    try {
      const validation = validateHomeroomAssignmentInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const updated = await ClassYearService.assignHomeroomTeacher(req.params.id, req.body.homeroom_staff_id);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await ClassYearService.delete(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Xóa lớp-năm học thành công' });
    } catch (err) { next(err); }
  }
}