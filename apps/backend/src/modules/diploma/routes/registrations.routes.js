import { Router } from 'express';
import { RegistrationController } from '../controller/registration.controller.js';
import { authenticate } from '../../core/services/author.service.js';

const router = Router();

router.get('/me/history', authenticate, RegistrationController.getMeHistory);
router.get('/me', authenticate, RegistrationController.getMe);
router.get('/stats', authenticate, RegistrationController.getStats);
router.get('/by-date', authenticate, RegistrationController.getByDate);
router.get('/export', authenticate, RegistrationController.exportExcel);
router.get('/', authenticate, RegistrationController.getList);
router.post('/', authenticate, RegistrationController.register);
router.delete('/:id', authenticate, RegistrationController.cancel);

export default router;