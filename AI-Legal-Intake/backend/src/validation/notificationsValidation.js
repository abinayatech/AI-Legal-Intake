const { param, query } = require('express-validator');

const notificationIdParam = [
  param('id').isUUID().withMessage('Notification ID must be a valid UUID'),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('unread_only').optional().isBoolean().withMessage('unread_only must be true or false'),
];

module.exports = { notificationIdParam, listQueryValidation };