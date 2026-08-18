export const validateAcademicYearInput = (data) => {
  const errors = [];
  const start = Number(data.start_year);
  const end = Number(data.end_year);

  if (!start || isNaN(start)) errors.push('start_year phải là một số hợp lệ.');
  if (!end || isNaN(end)) errors.push('end_year phải là một số hợp lệ.');
  if (start && end && end !== start + 1) {
    errors.push('end_year phải lớn hơn start_year đúng 1 năm (Quy tắc AY-02).');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};