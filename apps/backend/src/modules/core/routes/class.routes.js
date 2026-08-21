import { Router } from 'express';
import { ClassController } from '../controller/class.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();

router.get('/', authenticate, ClassController.getAll);
router.get('/:id', authenticate, ClassController.getById);
router.post('/', authenticate, ClassController.create);
router.patch('/:id', authenticate, ClassController.update);
router.delete('/:id', authenticate, ClassController.delete);

export default router;