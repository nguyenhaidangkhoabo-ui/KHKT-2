import { TokenService } from './token.service.js';
import { UserRole } from '../enums.js';
import { ClassAcademicYearRepository } from '../repositories/class-academic-year.repository.js';

// Middleware Authenticate
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

// Middleware Authorize theo Roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    next();
  };
};

// Middleware Phân quyền GVCN (Rule TCH-01, TCH-02, TCH-03)
export const checkTeacherClassAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const classAcademicYearId = req.params.classAcademicYearId || req.params.id;

    // BGH & ADMIN có toàn quyền
    if ([UserRole.ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BGH].includes(user.role)) {
      return next();
    }

    // Kiểm tra với Giáo viên (TEACHER)
    if (user.role === UserRole.TEACHER) {
      // TCH-02: Chỉ cho phép READ (GET)
      if (req.method !== 'GET') {
        return res.status(403).json({ message: 'Giáo viên chỉ có quyền xem dữ liệu, không được phép chỉnh sửa.' });
      }

      // TCH-01 & TCH-03: Phải là GVCN của lớp đó
      const classAY = await ClassAcademicYearRepository.findById(classAcademicYearId);
      if (!classAY || classAY.homeroom_staff_id?._id?.toString() !== user.sub) {
        return res.status(403).json({ message: 'Bạn không có quyền xem thông tin lớp học này (không phải GVCN).' });
      }

      return next();
    }

    return res.status(403).json({ message: 'Truy cập bị từ chối.' });
  } catch (error) {
    next(error);
  }
};
