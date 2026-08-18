export const validateClassYearInput = (data) => {
  const errors = [];
  if (!data.academic_year_id) errors.push('academic_year_id không được để trống.');
  if (!data.class_id) errors.push('class_id không được để trống.');
  return { isValid: errors.length === 0, errors };
};

export const validateHomeroomAssignmentInput = (data) => {
  const errors = [];
  if (!data.homeroom_staff_id) errors.push('homeroom_staff_id không được để trống.');
  return { isValid: errors.length === 0, errors };
};