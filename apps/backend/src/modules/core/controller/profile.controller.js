import * as profileService from '../services/profile.service.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export const me = async (req, res, next) => {
  try {
    const payload = req.access_token_payload;

    if (!payload?.uid || !payload?.role) {
      throw new AppError('Unauthenticated', HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED);
    }

    const user = await profileService.getProfile(payload.uid, payload.role);

    res.status(HttpStatus.OK).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

export default { me };
