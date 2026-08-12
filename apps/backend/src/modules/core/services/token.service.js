import jwt from 'jsonwebtoken';
import env from '../../../env.js';

export const genAccessToken = (payload, options = {}) => {

  if (!payload.uid || !payload.role) {
    throw new Error('Missing required fields');
  }

  if (typeof payload.uid !== 'string' || typeof payload.role !== 'string') {
    throw new Error('Invalid uid or role');
  }

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d', ...options });
};

export const verrifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export default {
  genAccessToken,
  verrifyAccessToken,
};
