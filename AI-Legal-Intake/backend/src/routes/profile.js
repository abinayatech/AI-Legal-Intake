// backend/src/routes/profile.js
import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateProfileRules,
  changePasswordRules,
} from '../validation/profileValidation.js';

const router = express.Router();

router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateProfileRules, validate, updateMyProfile);
router.post(
  '/change-password',
  authenticate,
  changePasswordRules,
  validate,
  changeMyPassword
);

export default router;