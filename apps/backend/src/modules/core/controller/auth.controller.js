import { AuthenService, ACCESS_TOKEN_COOKIE_NAME } from '../services/authen.service.js';
import { validateLoginInput } from '../dto/login.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 24 * 60 * 60 * 1000 
};

export const login = async (req, res, next) => {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      throw new AppError(validation.errors.join(' '), HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const { accessToken, user } = await AuthenService.login(req.body.username, req.body.password);
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, COOKIE_OPTIONS);
    res.status(HttpStatus.OK).json({ success: true, data: { token: accessToken, user } });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await AuthenService.logout();
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.status(HttpStatus.OK).json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err) {
    next(err);
  }
};

export default { login, logout };