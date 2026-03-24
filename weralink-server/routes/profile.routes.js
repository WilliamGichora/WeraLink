import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getMyProfile, updateMyProfile } from '../controllers/profile.controller.js';

const router = Router();

router.use(requireAuth); 

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

export default router;
