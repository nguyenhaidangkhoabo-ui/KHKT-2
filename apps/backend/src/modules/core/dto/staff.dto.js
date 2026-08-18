import { UserRole, UserStatus } from '../enums.js';

export const validateStaffInput = (data) => {
  const errors = [];
  if (!data.username || typeof data.username !== 'string') errors.push('Tên đăng nhập không được để trống.');
  if (!data.password || typeof data.password !== 'string') errors.push('Mật khẩu không được để trống.');
  if (!data.staff_code || typeof data.staff_code !== 'string') errors.push('Mã nhân viên không được để trống.');
  if (!data.full_name || typeof data.full_name !== 'string') errors.push('Họ tên không được để trống.');
  if (!data.email || typeof data.email !== 'string') errors.push('Email không được để trống.');
  if (data.role && !Object.values(UserRole).includes(data.role)) errors.push('Vai trò không hợp lệ.');
  return { isValid: errors.length === 0, errors };
};

export const validateStaffStatusInput = (data) => {
  const errors = [];
  if (!data.status || !Object.values(UserStatus).includes(data.status)) {
    errors.push('Trạng thái không hợp lệ (ACTIVE, DISABLED).');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateStaffRoleInput = (data) => {
  const errors = [];
  if (!data.role || ![UserRole.TEACHER, UserRole.BGH, UserRole.ADMIN, UserRole.SYSTEM_ADMIN].includes(data.role)) {
    errors.push('Vai trò không hợp lệ.');
  }
  return { isValid: errors.length === 0, errors };
};