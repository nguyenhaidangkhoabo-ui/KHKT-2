import { Router } from 'express';
import { me } from '../controller/profile.controller.js';

const router = Router();

router.get('/me', me);

export default router;
