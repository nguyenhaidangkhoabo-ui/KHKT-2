import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

export const validateCreateDiplomaInput = (data) => {
  const errors = [];
  if (!data.student_id || !isValidObjectId(data.student_id)) errors.push('student_id không hợp lệ.');
  if (!data.graduation_academic_year_id || !isValidObjectId(data.graduation_academic_year_id)) {
    errors.push('graduation_academic_year_id không hợp lệ.');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateBulkCreateInput = (data) => {
  const errors = [];
  if (Array.isArray(data.student_ids)) {
    if (data.student_ids.length === 0) errors.push('student_ids không được rỗng.');
    else if (!data.student_ids.every(isValidObjectId)) errors.push('student_ids chứa id không hợp lệ.');
  } else if (!data.academic_year_id || !isValidObjectId(data.academic_year_id)) {
    errors.push('Cần truyền academic_year_id hợp lệ (hoặc mảng student_ids).');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateBulkIdsInput = (data) => {
  const errors = [];
  if (!Array.isArray(data.diploma_ids) || data.diploma_ids.length === 0) {
    errors.push('diploma_ids phải là mảng không rỗng.');
  } else if (!data.diploma_ids.every(isValidObjectId)) {
    errors.push('diploma_ids chứa id không hợp lệ.');
  }
  return { isValid: errors.length === 0, errors };
};