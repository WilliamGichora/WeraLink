import { Router } from 'express';
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js';
import { PERMISSIONS } from '../config/roles.js';
import { getMatchesForGig, getRecommendedGigs } from '../controllers/matching.controller.js';

const router = Router();

// Direction B: Worker → Recommended Gigs
// GET /api/matches/gigs?limit=20
router.get('/gigs', requireAuth, requirePermission(PERMISSIONS.ASSIGNMENT_APPLY), getRecommendedGigs);

export default router;
