import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { raiseDispute, getDispute, addDisputeEvidence, getMyDisputes } from '../controllers/dispute.controller.js';

const router = Router();

router.use(requireAuth);

// Raise a dispute (any authenticated user who is a party)
router.post('/', raiseDispute);

// Get user's own disputes
router.get('/mine', getMyDisputes);

// Get a specific dispute
router.get('/:id', getDispute);

// Add evidence to a dispute
router.post('/:id/evidence', addDisputeEvidence);

export default router;
