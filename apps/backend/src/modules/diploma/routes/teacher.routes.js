import { Router } from 'express';
import { TeacherController } from '../controller/teacher.controller.js';
import { authenticate, authorizeRoles } from '../../core/services/author.service.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

router.get('/my-class', authenticate, authorizeRoles(UserRole.TEACHER), TeacherController.getMyClass);

export default router;