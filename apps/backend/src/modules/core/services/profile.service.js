import { StudentRole } from '../enums.js';
import * as studentAccountRepository from '../repositories/student-account.repository.js';
import * as teacherAccountRepository from '../repositories/teacher-account.repository.js';
import { AppError, HttpStatus, ErrorCode } from '../../../core/error.js';

const toPublicProfile = (account) => {
  const doc = account.toObject();
  const { _id, password_hash, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
};

export const getProfile = async (uid, role) => {
  let account = null;

  if (role === StudentRole.STUDENT) {
    account = await studentAccountRepository.findById(uid);
  } else {
    account = await teacherAccountRepository.findById(uid);
  }

  if (!account) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
  }

  return toPublicProfile(account);
};

export default { getProfile };
