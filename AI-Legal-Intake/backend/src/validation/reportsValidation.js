const { query } = require('express-validator');

const reportQueryValidation = [
  query('from_date').optional().isISO8601().withMessage('from_date must be ISO 8601'),
  query('to_date').optional().isISO8601().withMessage('to_date must be ISO 8601'),
  query('status')
    .optional()
    .isIn(['pending', 'new', 'in_review', 'resolved', 'closed'])
    .withMessage('Invalid status value'),
  query('assigned_to').optional().isUUID().withMessage('assigned_to must be a valid UUID'),
  query('firm_id').optional().isUUID().withMessage('firm_id must be a valid UUID'),
  query('classification').optional().isString().trim().isLength({ max: 100 }),
];

module.exports = { reportQueryValidation };