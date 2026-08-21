import { Router } from 'express';
import { AcademicYearController } from '../controller/academic-year.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();

router.get('/', authenticate, AcademicYearController.getAll);
router.get('/current', authenticate, AcademicYearController.getCurrent);
router.get('/:id', authenticate, AcademicYearController.getById);
router.post('/', authenticate, AcademicYearController.create);
router.patch('/:id', authenticate, AcademicYearController.update);
router.delete('/:id', authenticate, AcademicYearController.delete);
router.patch('/:id/set-current', authenticate, AcademicYearController.setCurrent);

export default router;