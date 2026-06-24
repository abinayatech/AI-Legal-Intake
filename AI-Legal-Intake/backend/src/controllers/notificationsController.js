const notificationsService = require('../services/notificationsService');
const { asyncHandler } = require('../middleware/errorHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const unreadOnly = req.query.unread_only === 'true';
  const result = await notificationsService.getUserNotifications(req.user.id, { page, limit, unreadOnly });
  res.json(result);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationsService.getUnreadCount(req.user.id);
  res.json({ count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markAsRead(req.params.id, req.user.id);
  res.json(notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllAsRead(req.user.id);
  res.json({ message: 'All notifications marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationsService.deleteNotification(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };