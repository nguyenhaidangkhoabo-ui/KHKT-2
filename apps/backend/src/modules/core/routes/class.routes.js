import { Router } from 'express';
import { ClassController } from '../controller/class.controller.js';
import { authenticate, authorizeRoles } from '../services/author.service.js';
import { UserRole } from '../enums.js';

const router = Router();

router.get('/', authenticate, ClassController.getAll);
router.get('/:id', authenticate, ClassController.getById);
router.post('/', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), ClassController.create);
router.patch('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), ClassController.update);
router.delete('/:id', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SYSTEM_ADMIN), ClassController.delete);

export default router;