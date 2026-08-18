import { ScheduleService } from '../services/schedule.service.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import { validateDayPatchInput } from '../dto/schedule.dto.js';

export class ScheduleController {
  static async getList(req, res, next) {
    try {
      const list = await ScheduleService.getList(req.query);
      return res.status(HttpStatus.OK).json({ success: true, data: list });
    } catch (err) { next(err); }
  }

  static async getCurrentWeek(req, res, next) {
    try {
      const data = await ScheduleService.getCurrentWeek();
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getNextWeek(req, res, next) {
    try {
      const data = await ScheduleService.getNextWeek();
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async generateNextWeek(req, res, next) {
    try {
      const created = await ScheduleService.generateNextWeek();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Đã tạo lịch phát bằng tuần sau.',
        data: created
      });
    } catch (err) { next(err); }
  }

  static async patchDay(req, res, next) {
    try {
      const validation = validateDayPatchInput({ ...req.body, dayOfWeek: req.params.dayOfWeek });
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const updated = await ScheduleService.patchDay(req.params.dayOfWeek, req.body);
      return res.status(HttpStatus.OK).json({ success: true, message: 'Cập nhật lịch thành công.', data: updated });
    } catch (err) { next(err); }
  }

  static async getAvailableDates(req, res, next) {
    try {
      const data = await ScheduleService.getAvailableDates();
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }
}