import { Router } from 'express';
import { ProfileController } from '../controller/profile.controller.js';
import { authenticate } from '../services/author.service.js';

const router = Router();
router.get('/me', authenticate, ProfileController.getMyProfile);
router.patch('/password', authenticate, ProfileController.changePassword);

export default router;