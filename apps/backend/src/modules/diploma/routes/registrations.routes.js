import { Router } from 'express';
import { RegistrationController } from '../controller/registration.controller.js';
import { authenticate, authorizeRoles } from '../../core/services/author.service.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

const MANAGER = [UserRole.BGH, UserRole.ADMIN, UserRole.SYSTEM_ADMIN];

router.get('/me/history', authenticate, RegistrationController.getMeHistory);
router.get('/me', authenticate, RegistrationController.getMe);
router.get('/stats', authenticate, authorizeRoles(...MANAGER), RegistrationController.getStats);
router.get('/by-date', authenticate, authorizeRoles(...MANAGER), RegistrationController.getByDate);
router.get('/export', authenticate, authorizeRoles(...MANAGER), RegistrationController.exportExcel);
router.get('/', authenticate, authorizeRoles(...MANAGER), RegistrationController.getList);
router.post('/', authenticate, RegistrationController.register);
router.delete('/:id', authenticate, RegistrationController.cancel);

export default router;