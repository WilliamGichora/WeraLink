import { Router } from 'express';
import { requireAuth, requireRole, requirePermission } from '../middlewares/auth.middleware.js';
import { PERMISSIONS } from '../config/roles.js';
import {
    createGig,
    getGigs,
    getGigById,
    getMyGigs,
    updateGig,
    deleteGig,
} from '../controllers/gig.controller.js';
import { getMatchesForGig } from '../controllers/matching.controller.js';

const router = Router();

router.get('/mine', requireAuth, requireRole(['EMPLOYER']), getMyGigs);

router.get('/', getGigs);

router.get('/:id', getGigById);

router.post('/', requireAuth, requirePermission(PERMISSIONS.GIG_CREATE), createGig);

router.put('/:id', requireAuth, requirePermission(PERMISSIONS.GIG_EDIT_OWN), updateGig);

router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.GIG_DELETE_OWN), deleteGig);

// Direction A: Employer → Find Recommended Workers for a Gig
router.get('/:gigId/matches', requireAuth, requirePermission(PERMISSIONS.MATCH_VIEW), getMatchesForGig);

export default router;
