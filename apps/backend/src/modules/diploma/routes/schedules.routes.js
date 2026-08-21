import { Router } from 'express';
import { ScheduleController } from '../controller/schedule.controller.js';
import { authenticate } from '../../core/services/author.service.js';

const router = Router();

router.get('/current-week', authenticate, ScheduleController.getCurrentWeek);
router.get('/next-week', authenticate, ScheduleController.getNextWeek);
router.post('/next-week/generate', authenticate, ScheduleController.generateNextWeek);
router.patch('/next-week/days/:dayOfWeek', authenticate, ScheduleController.patchDay);
router.get('/available-dates', authenticate, ScheduleController.getAvailableDates);
router.get('/', authenticate, ScheduleController.getList);

export default router;