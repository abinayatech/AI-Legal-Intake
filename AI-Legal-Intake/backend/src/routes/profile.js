const express = require('express')
const router = express.Router()
const {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} = require('../controllers/profileController')
const { authenticate } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const {
  updateProfileRules,
  changePasswordRules,
} = require('../validation/profileValidation')

router.get('/me', authenticate, getMyProfile)
router.put('/me', authenticate, updateProfileRules, validate, updateMyProfile)
router.post(
  '/change-password',
  authenticate,
  changePasswordRules,
  validate,
  changeMyPassword
)

module.exports = router