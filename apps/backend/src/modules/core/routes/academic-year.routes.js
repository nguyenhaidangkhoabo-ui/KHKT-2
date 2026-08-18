import { Router } from 'express';
import { AcademicYearController } from '../controller/academic-year.controller.js';
import { authenticate, authorizeRoles } from '../services/author.service.js';
import { UserRole } from '../enums.js';

const router = Router();

router.get('/', authenticate, AcademicYearController.getAll);
router.get('/current', authenticate, AcademicYearController.getCurrent);
router.get('/:id', authenticate, AcademicYearController.getById);
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), AcademicYearController.create);
router.patch('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), AcademicYearController.update);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), AcademicYearController.delete);
router.patch('/:id/set-current', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), AcademicYearController.setCurrent);

export default router;