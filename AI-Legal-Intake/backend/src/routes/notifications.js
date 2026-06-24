const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { notificationIdParam, listQueryValidation } = require('../validation/notificationsValidation');
const ctrl = require('../controllers/notificationsController');

router.use(authenticate);

// GET /api/notifications
// Returns paginated notifications for the logged-in user
router.get('/', listQueryValidation, validate, ctrl.getNotifications);

// GET /api/notifications/unread-count
// Returns the unread count badge number
router.get('/unread-count', ctrl.getUnreadCount);

// PATCH /api/notifications/read-all
// Marks all notifications as read
router.patch('/read-all', ctrl.markAllAsRead);

// PATCH /api/notifications/:id/read
// Marks a single notification as read
router.patch('/:id/read', notificationIdParam, validate, ctrl.markAsRead);

// DELETE /api/notifications/:id
// Deletes a notification
router.delete('/:id', notificationIdParam, validate, ctrl.deleteNotification);

module.exports = router;