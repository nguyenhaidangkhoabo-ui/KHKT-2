import { Router } from 'express';
import { ClassYearController } from '../controller/class-year.controller.js';
import { authenticate, authorizeRoles } from '../services/author.service.js';
import { UserRole } from '../enums.js';

const router = Router();

router.get('/', authenticate, ClassYearController.getAll);
router.get('/:id', authenticate, ClassYearController.getById);
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), ClassYearController.create);
router.patch('/:id/homeroom', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), ClassYearController.assignHomeroom);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), ClassYearController.delete);

export default router;