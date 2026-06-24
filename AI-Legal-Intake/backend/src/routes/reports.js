const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { reportQueryValidation } = require('../validation/reportsValidation');
const ctrl = require('../controllers/reportsController');

router.use(authenticate, requireRole('attorney', 'admin'));

// GET /api/reports/tickets
// Full ticket report with AI analysis, client and attorney info
router.get('/tickets', reportQueryValidation, validate, ctrl.getTicketReport);

// GET /api/reports/tickets/csv
// Same report as downloadable CSV
router.get('/tickets/csv', reportQueryValidation, validate, ctrl.downloadTicketReportCsv);

// GET /api/reports/intake
// Intake submission report with AI analysis
router.get('/intake', reportQueryValidation, validate, ctrl.getIntakeReport);

module.exports = router;