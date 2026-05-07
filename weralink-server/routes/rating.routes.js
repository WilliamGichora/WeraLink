import express from 'express';
import { requireAuth, requirePermission } from '../middlewares/auth.middleware.js';
import { PERMISSIONS } from '../config/roles.js';
import {
  submitRating,
  getUserRatings,
  getUserRatingSummary,
  checkRating,
  getAssignmentRatings,
} from '../controllers/rating.controller.js';

const router = express.Router();

// Submit a rating (Workers and Employers can rate each other)
router.post('/', requireAuth, requirePermission(PERMISSIONS.RATING_SUBMIT), submitRating);

// Get ratings received by a user (visible to authenticated users)
router.get('/user/:userId', requireAuth, getUserRatings);

// Get aggregate rating summary for a user
router.get('/user/:userId/summary', requireAuth, getUserRatingSummary);

// Check if current user has rated a specific assignment
router.get('/check/:assignmentId', requireAuth, checkRating);

// Get all ratings for a specific assignment (participant-only)
router.get('/assignment/:assignmentId', requireAuth, getAssignmentRatings);

export default router;
