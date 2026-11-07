import { Router } from 'express';
import { ClassYearController } from '../controller/class-year.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();

router.get('/', authenticate, ClassYearController.getAll);
router.get('/:id', authenticate, ClassYearController.getById);
router.post('/', authenticate, ClassYearController.create);
router.patch('/:id/homeroom', authenticate, ClassYearController.assignHomeroom);
router.post('/:id/auto-assign-students', authenticate, ClassYearController.autoAssignStudents);
router.delete('/:id', authenticate, ClassYearController.delete);

export default router;