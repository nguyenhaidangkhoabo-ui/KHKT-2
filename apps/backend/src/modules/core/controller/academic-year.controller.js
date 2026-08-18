import { AcademicYearService } from '../services/academic-year.service.js';
import { validateAcademicYearInput } from '../dto/academic-year.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class AcademicYearController {
  static async getAll(req, res, next) {
    try {
      const list = await AcademicYearService.getAll();
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const year = await AcademicYearService.getById(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data: year });
    } catch (err) { next(err); }
  }

  static async getCurrent(req, res, next) {
    try {
      const year = await AcademicYearService.getCurrent();
      return res.status(HttpStatus.OK).json({ success: true, data: year });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const validation = validateAcademicYearInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const created = await AcademicYearService.create(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: created });
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const updated = await AcademicYearService.update(req.params.id, req.body);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await AcademicYearService.delete(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Xóa năm học thành công' });
    } catch (err) { next(err); }
  }

  static async setCurrent(req, res, next) {
    try {
      const updated = await AcademicYearService.setCurrentAcademicYear(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Cập nhật năm học hiện tại thành công', data: updated });
    } catch (err) { next(err); }
  }
}