export const validateTeacherQueryInput = (data) => {
  const errors = [];
  if (data.academic_year_id && typeof data.academic_year_id !== 'string') {
    errors.push('academic_year_id không hợp lệ.');
  }
  return { isValid: errors.length === 0, errors };
};