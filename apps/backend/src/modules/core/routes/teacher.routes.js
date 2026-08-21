import { Router } from 'express';
import { TeacherController } from '../controller/teacher.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();

router.get('/my-classes', authenticate, TeacherController.getMyClasses);
router.get('/my-classes/:classAcademicYearId/students', authenticate, TeacherController.getClassStudents);

export default router;