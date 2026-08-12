import bcrypt from 'bcrypt';
import { UserStatus } from '../enums.js';
import * as studentAccountRepository from '../repositories/student-account.repository.js';
import * as teacherAccountRepository from '../repositories/teacher-account.repository.js';
import { genAccessToken } from './token.service.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

const findAccountByUsername = async (username) => {
  const student = await studentAccountRepository.findByUsername(username);
  if (student) return student;
  return teacherAccountRepository.findByUsername(username);
};

export const login = async ({ username, password }) => {
  const account = await findAccountByUsername(username);

  if (!account) {
    throw new AppError('Invalid username or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }

  const passwordMatches = await bcrypt.compare(password, account.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid username or password', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS);
  }

  if (account.status !== UserStatus.ACTIVE) {
    throw new AppError('Account is disabled', HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_DISABLED);
  }

  const accessToken = genAccessToken({
    uid: String(account._id),
    role: account.role,
  });

  return {
    accessToken,
    user: {
      id: String(account._id),
      username: account.username,
      role: account.role,
      full_name: account.full_name,
    },
  };
};

export const logout = async () => ({ success: true });

export default { login, logout };
