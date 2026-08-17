import { Router } from 'express';
import { AcademicYearController } from '../controller/academic-year.controller.js';
import { authenticate, authorizeRoles } from '../services/author.service.js';
import { UserRole } from '../enums.js';

const router = Router();
router.get('/', authenticate, AcademicYearController.getAll);
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), AcademicYearController.create);
router.patch('/:id/set-current', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), AcademicYearController.setCurrent);

export default router;
