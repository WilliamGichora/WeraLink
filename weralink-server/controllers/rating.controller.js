import { respond } from '../utils/respond.js';
import { RatingService } from '../services/rating.service.js';

/**
 * RatingController
 * RESTful endpoints for the bidirectional rating system.
 * 
 * All endpoints follow the existing WeraLink API conventions:
 * - respond(res, statusCode, data, meta, errors)
 * - IDOR prevention via service-level ownership checks
 * - Input validation before service calls
 */

/**
 * POST /api/ratings
 * Body: { assignmentId, score, dimensions?, comment? }
 * Auth: requireAuth + requirePermission(RATING_SUBMIT)
 */
export const submitRating = async (req, res) => {
  try {
    const raterId = req.user.id;
    const { assignmentId, score, dimensions, comment } = req.body;

    if (!assignmentId) {
      return respond(res, 422, null, null, [
        { code: 'VALIDATION_ERROR', field: 'assignmentId', message: 'Assignment ID is required.' },
      ]);
    }

    if (score === undefined || score === null) {
      return respond(res, 422, null, null, [
        { code: 'VALIDATION_ERROR', field: 'score', message: 'Score is required.' },
      ]);
    }

    const rating = await RatingService.submitRating(assignmentId, raterId, {
      score: Number(score),
      dimensions,
      comment,
    });

    return respond(res, 201, { rating });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const code = statusCode === 500 ? 'INTERNAL_ERROR' : 'RATING_ERROR';
    console.error('Submit Rating Error:', error.message);
    return respond(res, statusCode, null, null, [
      { code, message: error.message || 'Failed to submit rating.' },
    ]);
  }
};

/**
 * GET /api/ratings/user/:userId
 * Auth: requireAuth
 * Query: ?page=1&limit=10
 */
export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await RatingService.getRatingsForUser(userId, { page, limit });

    return respond(res, 200, result.ratings, result.meta);
  } catch (error) {
    console.error('Get User Ratings Error:', error.message);
    return respond(res, 500, null, null, [
      { code: 'INTERNAL_ERROR', message: 'Failed to retrieve ratings.' },
    ]);
  }
};

/**
 * GET /api/ratings/user/:userId/summary
 * Auth: requireAuth
 */
export const getUserRatingSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const summary = await RatingService.getUserRatingSummary(userId);

    return respond(res, 200, { summary });
  } catch (error) {
    console.error('Get Rating Summary Error:', error.message);
    return respond(res, 500, null, null, [
      { code: 'INTERNAL_ERROR', message: 'Failed to retrieve rating summary.' },
    ]);
  }
};

/**
 * GET /api/ratings/check/:assignmentId
 * Auth: requireAuth
 * Returns whether the authenticated user has already rated this assignment.
 */
export const checkRating = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const raterId = req.user.id;

    const result = await RatingService.checkRating(assignmentId, raterId);
    return respond(res, 200, result);
  } catch (error) {
    console.error('Check Rating Error:', error.message);
    return respond(res, 500, null, null, [
      { code: 'INTERNAL_ERROR', message: 'Failed to check rating status.' },
    ]);
  }
};

/**
 * GET /api/ratings/assignment/:assignmentId
 * Auth: requireAuth (must be participant)
 */
export const getAssignmentRatings = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const requesterId = req.user.id;

    const ratings = await RatingService.getRatingsForAssignment(assignmentId, requesterId);
    return respond(res, 200, { ratings });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error('Get Assignment Ratings Error:', error.message);
    return respond(res, statusCode, null, null, [
      { code: statusCode === 500 ? 'INTERNAL_ERROR' : 'RATING_ERROR', message: error.message },
    ]);
  }
};
