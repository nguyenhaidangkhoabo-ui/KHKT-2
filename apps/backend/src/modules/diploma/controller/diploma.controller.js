import { DiplomaService } from '../services/diploma.service.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import {
  validateCreateDiplomaInput,
  validateBulkCreateInput,
  validateBulkIdsInput
} from '../dto/diploma.dto.js';

export class DiplomaController {
  static async getMe(req, res, next) {
    try {
      const data = await DiplomaService.getMe(req.user.sub);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getStats(req, res, next) {
    try {
      const data = await DiplomaService.getStats();
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getAll(req, res, next) {
    try {
      const list = await DiplomaService.getAll(req.query);
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const data = await DiplomaService.getById(req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const validation = validateCreateDiplomaInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const created = await DiplomaService.create(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: created });
    } catch (err) { next(err); }
  }

  static async bulkCreate(req, res, next) {
    try {
      const validation = validateBulkCreateInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const result = await DiplomaService.bulkCreate(req.body);
      return res.status(HttpStatus.CREATED).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  static async receive(req, res, next) {
    try {
      const updated = await DiplomaService.receive(req.params.id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đã cập nhật bằng sang trạng thái Đã lưu tại trường.',
        data: updated
      });
    } catch (err) { next(err); }
  }

  static async bulkReceive(req, res, next) {
    try {
      const validation = validateBulkIdsInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const result = await DiplomaService.bulkReceive(req.body.diploma_ids);
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  static async handover(req, res, next) {
    try {
      const updated = await DiplomaService.handover(req.params.id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Đã trao bằng tốt nghiệp cho học sinh.',
        data: updated
      });
    } catch (err) { next(err); }
  }

  static async bulkHandover(req, res, next) {
    try {
      const validation = validateBulkIdsInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const result = await DiplomaService.bulkHandover(req.body.diploma_ids);
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}