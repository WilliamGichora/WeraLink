import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getMyProfile, updateMyProfile, addMySkill, removeMySkill, getPublicEmployerProfile } from '../controllers/profile.controller.js';

const router = Router();

// Public route — no auth required
router.get('/employer/:id', getPublicEmployerProfile);

router.use(requireAuth); 

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

router.post('/me/skills', addMySkill);
router.delete('/me/skills/:skillId', removeMySkill);

export default router;
