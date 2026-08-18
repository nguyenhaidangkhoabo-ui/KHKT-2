import { ProfileService } from '../services/profile.service.js';
import { validateChangePasswordInput } from '../dto/profile.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export class ProfileController {
  static async getMyProfile(req, res, next) {
    try {
      const profile = await ProfileService.getProfile(req.user.sub, req.user.is_staff);
      return res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (err) { next(err); }
  }

  static async changePassword(req, res, next) {
    try {
      const validation = validateChangePasswordInput(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      const updated = await ProfileService.changePassword(
        req.user.sub,
        req.user.is_staff,
        req.body.old_password,
        req.body.new_password
      );
      return res.status(HttpStatus.OK).json({ success: true, message: 'Đổi mật khẩu thành công', data: updated });
    } catch (err) { next(err); }
  }
}