const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const validateRegisterInput = (data) => {
  const errors = [];
  if (!data.pickup_date || typeof data.pickup_date !== 'string' || !DATE_REGEX.test(data.pickup_date)) {
    errors.push('pickup_date không hợp lệ (định dạng YYYY-MM-DD).');
  }
  return { isValid: errors.length === 0, errors };
};