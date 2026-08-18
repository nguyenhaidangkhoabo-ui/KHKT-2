import { Router } from 'express';
import { ScheduleController } from '../controller/schedule.controller.js';
import { authenticate, authorizeRoles } from '../../core/services/author.service.js';
import { UserRole } from '../../core/enums.js';

const router = Router();

const MANAGER = [UserRole.BGH, UserRole.ADMIN, UserRole.SYSTEM_ADMIN];

router.get('/current-week', authenticate, authorizeRoles(...MANAGER), ScheduleController.getCurrentWeek);
router.get('/next-week', authenticate, authorizeRoles(...MANAGER), ScheduleController.getNextWeek);
router.post('/next-week/generate', authenticate, authorizeRoles(...MANAGER), ScheduleController.generateNextWeek);
router.patch('/next-week/days/:dayOfWeek', authenticate, authorizeRoles(...MANAGER), ScheduleController.patchDay);
router.get('/available-dates', authenticate, ScheduleController.getAvailableDates);
router.get('/', authenticate, authorizeRoles(...MANAGER), ScheduleController.getList);

export default router;