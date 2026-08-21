import { Router } from 'express';
import { DiplomaController } from '../controller/diploma.controller.js';
import { authenticate } from '../../core/services/author.service.js';

const router = Router();


router.get('/me', authenticate, DiplomaController.getMe);
router.get('/stats', authenticate, DiplomaController.getStats);
router.get('/', authenticate, DiplomaController.getAll);
router.post('/bulk-create', authenticate, DiplomaController.bulkCreate);
router.post('/bulk-receive', authenticate, DiplomaController.bulkReceive);
router.post('/bulk-handover', authenticate, DiplomaController.bulkHandover);


router.get('/:id', authenticate, DiplomaController.getById);
router.post('/', authenticate, DiplomaController.create);
router.post('/:id/receive', authenticate, DiplomaController.receive);
router.post('/:id/handover', authenticate, DiplomaController.handover);

export default router;