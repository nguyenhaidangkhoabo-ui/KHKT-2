import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-core-v3';

export class TokenService {
  static generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }

  static verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}

export const verrifyAccessToken = (token) => TokenService.verifyToken(token);