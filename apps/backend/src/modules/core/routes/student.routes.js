import { Router } from 'express';
import { StudentController } from '../controller/student.controller.js';
import { authenticate, authorizeRoles, checkTeacherClassAccess } from '../services/author.service.js';
import { UserRole } from '../enums.js';

const router = Router();

// Lấy danh sách HS theo lớp năm học (Đã áp dụng TCH-01, TCH-02, TCH-03)
router.get('/class-academic-year/:classAcademicYearId', authenticate, checkTeacherClassAccess, StudentController.getStudentsByClassAY);

// Cập nhật trạng thái học vụ (ADMIN / BGH)
router.patch('/:id/status', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.BGH), StudentController.updateStatus);

export default router;
