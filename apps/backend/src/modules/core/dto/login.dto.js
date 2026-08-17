export const validateLoginInput = (data) => {
  const errors = [];
  if (!data.username || typeof data.username !== 'string') {
    errors.push('Tên đăng nhập không được để trống.');
  }
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Mật khẩu không được để trống.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
