import { AcademicStatus } from '../enums.js';

export const validateStatusUpdateInput = (data) => {
  const errors = [];
  if (!data.academic_status || !Object.values(AcademicStatus).includes(data.academic_status)) {
    errors.push('Trạng thái học vụ mới không hợp lệ.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
