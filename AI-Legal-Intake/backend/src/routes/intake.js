const express = require('express')
const router = express.Router()
const { submitIntake } = require('../controllers/intakeCtrl')

router.post('/', submitIntake)

module.exports = router