import { StaffService } from '../services/staff.service.js';
import { validateStaffInput, validateStaffStatusInput, validateStaffRoleInput } from '../dto/staff.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class StaffController {
  static async getAll(req, res, next) {
    try {
      const list = await StaffService.getAll(req.query);
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const staff = await StaffService.getById(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data: staff });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const validation = validateStaffInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const created = await StaffService.create(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: created });
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const updated = await StaffService.update(req.params.id, req.body);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async updateStatus(req, res, next) {
    try {
      const validation = validateStaffStatusInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const updated = await StaffService.updateStatus(req.params.id, req.body.status);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async updateRole(req, res, next) {
    try {
      const validation = validateStaffRoleInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const updated = await StaffService.updateRole(req.params.id, req.body.role);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await StaffService.delete(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Xóa nhân viên thành công' });
    } catch (err) { next(err); }
  }

  static async importExcel(req, res, next) {
    try {
      const rows = req.parsedRows || [];
      const result = await StaffService.importFromExcel(rows);
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}