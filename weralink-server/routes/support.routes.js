import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { createTicket, getMyTickets, getTicketById } from '../controllers/support.controller.js';

const router = Router();

router.use(requireAuth);

// Create a support ticket
router.post('/tickets', createTicket);

// Get my tickets
router.get('/tickets/mine', getMyTickets);

// Get a specific ticket
router.get('/tickets/:id', getTicketById);

export default router;
