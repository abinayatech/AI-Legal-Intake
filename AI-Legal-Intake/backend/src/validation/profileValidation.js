// backend/src/validation/profileValidation.js
import { body } from 'express-validator';

/**
 * updateProfileRules
 * Validates PUT /api/profile/me
 */
const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'.-]+$/)
    .withMessage('Name can only contain letters, spaces, and basic punctuation'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Phone number must be 7–15 digits, optionally starting with +'),

  body('avatar_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

/**
 * changePasswordRules
 * Validates POST /api/profile/change-password
 */
const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),

  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

export { updateProfileRules, changePasswordRules };