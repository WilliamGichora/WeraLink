import express from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(requireAuth);

router.get('/', NotificationController.getUserNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);

export default router;
