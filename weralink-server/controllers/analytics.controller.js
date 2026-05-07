import { respond } from '../utils/respond.js';
import { AnalyticsService } from '../services/analytics.service.js';

/**
 * AnalyticsController
 * Serves aggregated analytics data for dashboards.
 * 
 * Security:
 * - Worker/Employer endpoints are user-scoped (own data only)
 * - Admin endpoint is role-gated at route level
 * - No user input directly reaches DB queries (IDOR-safe)
 */

/**
 * GET /api/analytics/worker
 * Auth: requireAuth + requirePermission(ANALYTICS_VIEW_OWN)
 * Query: ?months=6
 */
export const getWorkerAnalytics = async (req, res) => {
  try {
    const workerId = req.user.id;
    const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6));

    const analytics = await AnalyticsService.getWorkerAnalytics(workerId, { months });
    return respond(res, 200, analytics);
  } catch (error) {
    console.error('Worker Analytics Error:', error.message);
    return respond(res, 500, null, null, [
      { code: 'INTERNAL_ERROR', message: 'Failed to retrieve worker analytics.' },
    ]);
  }
};

/**
 * GET /api/analytics/employer
 * Auth: requireAuth + requirePermission(ANALYTICS_VIEW_OWN)
 * Query: ?months=6
 */
export const getEmployerAnalytics = async (req, res) => {
  try {
    const employerId = req.user.id;
    const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6));

    const analytics = await AnalyticsService.getEmployerAnalytics(employerId, { months });
    return respond(res, 200, analytics);
  } catch (error) {
    console.error('Employer Analytics Error:', error.message);
    return respond(res, 500, null, null, [
      { code: 'INTERNAL_ERROR', message: 'Failed to retrieve employer analytics.' },
    ]);
  }
};

/**
 * GET /api/analytics/admin
 * Auth: requireAuth + requireRole(ADMIN)
 * Query: ?months=6
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6));

    const analytics = await AnalyticsService.getAdminAnalytics({ months });
    return respond(res, 200, analytics);
  } catch (error) {
    console.error('Admin Analytics Error:', error.message);
    return respond(res, 500, null, null, [
      { code: 'INTERNAL_ERROR', message: 'Failed to retrieve platform analytics.' },
    ]);
  }
};
