import * as authenService from '../services/authen.service.js';
import { validateLoginInput } from '../dto/login.dto.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

const ACCESS_TOKEN_COOKIE = authenService.ACCESS_TOKEN_COOKIE_NAME;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const login = async (req, res, next) => {
  try {
    const { valid, value, error } = validateLoginInput(req.body);
    if (!valid) {
      throw new AppError(error, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const { accessToken, user } = await authenService.login(value);

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
    res.status(HttpStatus.OK).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authenService.logout();
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.status(HttpStatus.OK).json({ status: 'success', message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export default { login, logout };
