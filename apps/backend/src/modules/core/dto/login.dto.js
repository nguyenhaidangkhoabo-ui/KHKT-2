export const validateLoginInput = (payload) => {
  const errors = [];
  const username = typeof payload?.username === 'string' ? payload.username.trim() : '';
  const password = typeof payload?.password === 'string' ? payload.password : '';

  if (!username) errors.push('username is required');
  if (!password) errors.push('password is required');

  if (errors.length > 0) {
    return { valid: false, error: errors.join(', ') };
  }
  return { valid: true, value: { username, password } };
};
