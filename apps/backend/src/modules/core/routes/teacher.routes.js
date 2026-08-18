import { Router } from 'express';
import { TeacherController } from '../controller/teacher.controller.js';
import { authenticate, authorizeRoles, checkTeacherClassAccess } from '../services/author.service.js';
import { UserRole } from '../enums.js';

const router = Router();

router.get('/my-classes', authenticate, authorizeRoles(UserRole.TEACHER), TeacherController.getMyClasses);
router.get('/my-classes/:classAcademicYearId/students', authenticate, authorizeRoles(UserRole.TEACHER), checkTeacherClassAccess, TeacherController.getClassStudents);

export default router;