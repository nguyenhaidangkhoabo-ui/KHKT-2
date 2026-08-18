import { Router } from 'express';
import { DiplomaController } from '../controller/diploma.controller.js';
import { authenticate, authorizeRoles } from '../../core/services/author.service.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

const MANAGER = [UserRole.BGH, UserRole.ADMIN, UserRole.SYSTEM_ADMIN];

// Route tĩnh TRƯỚC route động
router.get('/me', authenticate, DiplomaController.getMe);
router.get('/stats', authenticate, authorizeRoles(...MANAGER), DiplomaController.getStats);
router.get('/', authenticate, authorizeRoles(...MANAGER), DiplomaController.getAll);
router.post('/bulk-create', authenticate, authorizeRoles(...MANAGER), DiplomaController.bulkCreate);
router.post('/bulk-receive', authenticate, authorizeRoles(...MANAGER), DiplomaController.bulkReceive);
router.post('/bulk-handover', authenticate, authorizeRoles(...MANAGER), DiplomaController.bulkHandover);

// Route động
router.get('/:id', authenticate, authorizeRoles(...MANAGER), DiplomaController.getById);
router.post('/', authenticate, authorizeRoles(...MANAGER), DiplomaController.create);
router.post('/:id/receive', authenticate, authorizeRoles(...MANAGER), DiplomaController.receive);
router.post('/:id/handover', authenticate, authorizeRoles(...MANAGER), DiplomaController.handover);

export default router;