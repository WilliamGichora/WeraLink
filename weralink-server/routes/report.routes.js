import express from 'express';
import { requireAuth, requirePermission, requireRole } from '../middlewares/auth.middleware.js';
import { PERMISSIONS, ROLES } from '../config/roles.js';
import {
  getWorkerEarnings,
  getWorkerHistory,
  getWorkerPerformance,
  getWorkerSkills,
  getEmployerSpending,
  getEmployerGigActivity,
  getEmployerPaymentLedger,
  getEmployerWorkerReview,
  getEmployerHiringEfficiency,
  getAdminPlatformActivity,
  getAdminFinancialRecon,
  getAdminUserTrust,
} from '../controllers/report.controller.js';

const router = express.Router();

// Worker reports (user-scoped)
router.get('/worker/earnings', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getWorkerEarnings);
router.get('/worker/history', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getWorkerHistory);
router.get('/worker/performance', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getWorkerPerformance);
router.get('/worker/skills', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getWorkerSkills);

// Employer reports (user-scoped)
router.get('/employer/spending', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getEmployerSpending);
router.get('/employer/gig-activity', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getEmployerGigActivity);
router.get('/employer/payment-ledger', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getEmployerPaymentLedger);
router.get('/employer/worker-review/:workerId', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getEmployerWorkerReview);
router.get('/employer/hiring-efficiency', requireAuth, requirePermission(PERMISSIONS.REPORT_GENERATE), getEmployerHiringEfficiency);

// Admin reports
router.get('/admin/platform-activity', requireAuth, requireRole([ROLES.ADMIN]), getAdminPlatformActivity);
router.get('/admin/financial-recon', requireAuth, requireRole([ROLES.ADMIN]), getAdminFinancialRecon);
router.get('/admin/user-trust', requireAuth, requireRole([ROLES.ADMIN]), getAdminUserTrust);

export default router;
