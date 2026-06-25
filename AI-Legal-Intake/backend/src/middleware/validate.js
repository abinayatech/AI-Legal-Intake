// backend/src/middleware/validate.js
import { validationResult } from 'express-validator';

/**
 * validate
 * Runs after express-validator chains.
 * Returns 400 with structured errors if any field failed validation.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

export { validate };