import { Grade } from '../enums.js';

export const validateClassInput = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Tên lớp không được để trống.');
  }
  if (!data.grade || !Object.values(Grade).includes(data.grade)) {
    errors.push('Khối (grade) không hợp lệ (GRADE_10, GRADE_11, GRADE_12).');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
