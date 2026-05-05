import NotificationService from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/error.utils.js';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get all notifications for the authenticated user
   */
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user?.id || req.query.userId; // Fallback for testing
      
      if (!userId) {
        return errorResponse(res, { message: 'User not authenticated', code: 'UNAUTHORIZED' }, 401);
      }

      const notifications = await NotificationService.getUserNotifications(userId);
      return successResponse(res, notifications);
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a specific notification as read
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.body.userId; // Fallback
      
      if (!userId) {
        return errorResponse(res, { message: 'User not authenticated', code: 'UNAUTHORIZED' }, 401);
      }

      await NotificationService.markAsRead(id, userId);
      return successResponse(res, null, 'Notification marked as read');
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for the user
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user?.id || req.body.userId; // Fallback
      
      if (!userId) {
        return errorResponse(res, { message: 'User not authenticated', code: 'UNAUTHORIZED' }, 401);
      }

      await NotificationService.markAllAsRead(userId);
      return successResponse(res, null, 'All notifications marked as read');
    } catch (error) {
      return errorResponse(res, error);
    }
  }
}
