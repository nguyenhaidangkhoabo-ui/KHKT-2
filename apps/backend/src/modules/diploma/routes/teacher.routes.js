import { Router } from 'express';
import { TeacherController } from '../controller/teacher.controller.js';
import { authenticate } from '../../core/services/author.service.js';

const router = Router();

router.get('/my-class', authenticate, TeacherController.getMyClass);

export default router;