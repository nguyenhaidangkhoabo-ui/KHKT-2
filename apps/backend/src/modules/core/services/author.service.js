import { TokenService } from './token.service.js';


export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yêu cầu Token xác thực.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = TokenService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};


export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    next();
  };
};

export const checkTeacherClassAccess = async (req, res, next) => {
  next();
};
