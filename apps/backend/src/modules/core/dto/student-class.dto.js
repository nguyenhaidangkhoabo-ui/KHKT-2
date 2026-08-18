export const validateAssignStudentInput = (data) => {
  const errors = [];
  if (!data.class_academic_year_id) errors.push('class_academic_year_id không được để trống.');
  if (!data.student_id) errors.push('student_id không được để trống.');
  return { isValid: errors.length === 0, errors };
};

export const validateBulkAssignInput = (data) => {
  const errors = [];
  if (!data.class_academic_year_id) errors.push('class_academic_year_id không được để trống.');
  if (!Array.isArray(data.student_ids) || data.student_ids.length === 0) {
    errors.push('student_ids phải là mảng không rỗng.');
  }
  return { isValid: errors.length === 0, errors };
};