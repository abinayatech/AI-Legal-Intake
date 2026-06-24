const { query } = require('express-validator');

const volumeTrendValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('days must be an integer between 1 and 365'),
  query('firm_id').optional().isUUID().withMessage('firm_id must be a valid UUID'),
];

const firmIdValidation = [
  query('firm_id').optional().isUUID().withMessage('firm_id must be a valid UUID'),
];

module.exports = { volumeTrendValidation, firmIdValidation };