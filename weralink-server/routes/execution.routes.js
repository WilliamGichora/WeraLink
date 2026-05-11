import express from 'express';
import { ExecutionController } from '../controllers/execution.controller.js';
import { requireAuth, requirePermission, requireRole } from '../middlewares/auth.middleware.js';
import { PERMISSIONS, ROLES } from '../config/roles.js';

const router = express.Router();

// Workers applying for gigs
router.post('/gigs/:id/apply', requireAuth, requirePermission(PERMISSIONS.ASSIGNMENT_APPLY), ExecutionController.applyForGig);

// Worker views their own work
router.get('/assignments/worker', requireAuth, requireRole([ROLES.WORKER]), ExecutionController.getWorkerAssignments);

// Employer Applicant Management (Global)
router.get('/assignments/employer', requireAuth, requirePermission(PERMISSIONS.GIG_MANAGE), ExecutionController.getEmployerApplicants);
router.get('/assignments/employer/hired-workers', requireAuth, requireRole([ROLES.EMPLOYER]), ExecutionController.getEmployerHiredWorkers);

// General assignment view (must be authorized owner)
router.get('/assignments/:id', requireAuth, requirePermission(PERMISSIONS.ASSIGNMENT_VIEW_OWN), ExecutionController.getAssignmentById);

// Evidence handling
router.post('/evidence/presigned-url', requireAuth, requirePermission(PERMISSIONS.EVIDENCE_SUBMIT), ExecutionController.getPresignedUrl);
router.post('/evidence/download-url', requireAuth, ExecutionController.getPresignedDownloadUrl);
router.post('/assignments/:id/submit', requireAuth, requirePermission(PERMISSIONS.EVIDENCE_SUBMIT), ExecutionController.submitWork);

// Employer Review (Employers only)
router.post('/assignments/:id/review', requireAuth, requirePermission(PERMISSIONS.EVIDENCE_REVIEW), ExecutionController.reviewWork);
router.post('/assignments/:id/retry-payout', requireAuth, requirePermission(PERMISSIONS.EVIDENCE_REVIEW), ExecutionController.retryPayout);
router.post('/assignments/:id/reject', requireAuth, requirePermission(PERMISSIONS.GIG_MANAGE), ExecutionController.rejectApplication);
router.get('/assignments/employer/reviews', requireAuth, requirePermission(PERMISSIONS.EVIDENCE_REVIEW), ExecutionController.getEmployerPendingReviews);
router.get('/assignments/employer/history', requireAuth, requireRole([ROLES.EMPLOYER]), ExecutionController.getEmployerHistory);

// Employer Applicant Management (Per Gig)
router.get('/gigs/:id/applicants', requireAuth, requirePermission(PERMISSIONS.GIG_MANAGE), ExecutionController.getGigApplicants);

export default router;
