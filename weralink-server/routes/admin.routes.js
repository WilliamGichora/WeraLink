import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/roles.js';
import {
  listUsers, getUserDetail, suspendUser, unsuspendUser, editUser,
  getPlatformStats,
  listDisputes, getDisputeDetail, resolveDispute,
  listSupportTickets, updateTicketStatus,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(requireAuth, requireRole([ROLES.ADMIN]));

// User management
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/unsuspend', unsuspendUser);
router.patch('/users/:id', editUser);

// Platform stats
router.get('/stats', getPlatformStats);

// Dispute management
router.get('/disputes', listDisputes);
router.get('/disputes/:id', getDisputeDetail);
router.post('/disputes/:id/resolve', resolveDispute);

// Support ticket management
router.get('/support-tickets', listSupportTickets);
router.patch('/support-tickets/:id', updateTicketStatus);

export default router;
