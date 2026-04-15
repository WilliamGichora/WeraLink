import { Router } from 'express';
import { getAllSkills } from '../controllers/skill.controller.js';

const router = Router();

router.get('/', getAllSkills);

export default router;
