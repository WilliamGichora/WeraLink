import prisma from '../config/prisma.js';

class NotificationService {
  /**
   * Get all notifications for a specific user
   */
  static async getUserNotifications(userId) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to latest 20
    });
  }

  /**
   * Create a new notification
   */
  static async createNotification(data) {
    // data: { userId, title, message, type, linkUrl }
    return await prisma.notification.create({
      data
    });
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId // Ensure user owns the notification
      },
      data: { isRead: true }
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

export default NotificationService;
