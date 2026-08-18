import { RegistrationService } from '../services/registration.service.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';
import { validateRegisterInput } from '../dto/registration.dto.js';

export class RegistrationController {
  static async getMe(req, res, next) {
    try {
      const data = await RegistrationService.getMe(req.user.sub);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getMeHistory(req, res, next) {
    try {
      const data = await RegistrationService.getMeHistory(req.user.sub);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async register(req, res, next) {
    try {
      const validation = validateRegisterInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const created = await RegistrationService.register(req.user.sub, req.body);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Đăng ký nhận bằng thành công.',
        data: created
      });
    } catch (err) { next(err); }
  }

  static async cancel(req, res, next) {
    try {
      const result = await RegistrationService.cancel(req.user, req.params.id);
      return res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  static async getStats(req, res, next) {
    try {
      const data = await RegistrationService.getStats();
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getList(req, res, next) {
    try {
      const data = await RegistrationService.getList(req.query);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getByDate(req, res, next) {
    try {
      const data = await RegistrationService.getByDate(req.query.pickup_date);
      return res.status(HttpStatus.OK).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async exportExcel(req, res, next) {
    try {
      const rows = await RegistrationService.getByDate(req.query.pickup_date);
      const xlsx = (await import('xlsx')).default;
      const worksheet = xlsx.utils.json_to_sheet(rows);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'registrations');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=registrations-${req.query.pickup_date || 'all'}.xlsx`);
      return res.send(buffer);
    } catch (err) { next(err); }
  }
}