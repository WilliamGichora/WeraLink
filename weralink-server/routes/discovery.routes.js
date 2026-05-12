import { Router } from 'express';
import { getLandingStats, getFeatured, getPublicProfile } from '../controllers/discovery.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Public discovery routes for landing page and guest exploration.
 */
router.get('/stats', getLandingStats);
router.get('/featured', getFeatured);
router.get('/profile/:userId', optionalAuth, getPublicProfile);

export default router;
