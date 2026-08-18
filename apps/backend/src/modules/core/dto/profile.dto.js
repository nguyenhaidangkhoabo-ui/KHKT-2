export const validateChangePasswordInput = (data) => {
  const errors = [];
  if (!data.old_password || typeof data.old_password !== 'string') {
    errors.push('Mật khẩu cũ không được để trống.');
  }
  if (!data.new_password || typeof data.new_password !== 'string') {
    errors.push('Mật khẩu mới không được để trống.');
  } else if (data.new_password.length < 6) {
    errors.push('Mật khẩu mới phải có ít nhất 6 ký tự.');
  }
  if (data.new_password && data.old_password && data.new_password === data.old_password) {
    errors.push('Mật khẩu mới phải khác mật khẩu cũ.');
  }
  return { isValid: errors.length === 0, errors };
};