import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getModules, getModule, submitQuiz } from '../controllers/training.controller.js';

const router = express.Router();

// Apply auth middleware to all routes below
router.use(requireAuth);

router.get('/modules', getModules);
router.get('/modules/:id', getModule);
router.post('/modules/:id/submit', submitQuiz);

export default router;
