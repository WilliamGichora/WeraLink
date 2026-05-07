import express from 'express';
import { requireAuth, requirePermission, requireRole } from '../middlewares/auth.middleware.js';
import { PERMISSIONS, ROLES } from '../config/roles.js';
import {
  getWorkerAnalytics,
  getEmployerAnalytics,
  getAdminAnalytics,
} from '../controllers/analytics.controller.js';

const router = express.Router();

// Worker analytics (user-scoped)
router.get('/worker', requireAuth, requirePermission(PERMISSIONS.ANALYTICS_VIEW_OWN), getWorkerAnalytics);

// Employer analytics (user-scoped)
router.get('/employer', requireAuth, requirePermission(PERMISSIONS.ANALYTICS_VIEW_OWN), getEmployerAnalytics);

// Admin platform analytics
router.get('/admin', requireAuth, requireRole([ROLES.ADMIN]), getAdminAnalytics);

export default router;
