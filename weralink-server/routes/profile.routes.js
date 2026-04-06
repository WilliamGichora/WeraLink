import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getMyProfile, updateMyProfile, addMySkill, removeMySkill } from '../controllers/profile.controller.js';

const router = Router();

router.use(requireAuth); 

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

router.post('/me/skills', addMySkill);
router.delete('/me/skills/:skillId', removeMySkill);

export default router;
