const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { volumeTrendValidation, firmIdValidation } = require('../validation/analyticsValidation');
const ctrl = require('../controllers/analyticsController');

// All analytics routes require attorney or admin role
router.use(authenticate, requireRole('attorney', 'admin'));

// GET /api/analytics/summary
// High-level KPI counters: total tickets, open, resolved, avg resolution time
router.get('/summary', firmIdValidation, validate, ctrl.getSummary);

// GET /api/analytics/volume?days=30&firm_id=uuid
// Daily ticket volume trend
router.get('/volume', volumeTrendValidation, validate, ctrl.getVolumeTrend);

// GET /api/analytics/classifications?firm_id=uuid
// Ticket count by AI legal classification
router.get('/classifications', firmIdValidation, validate, ctrl.getByClassification);

// GET /api/analytics/workload?firm_id=uuid
// Per-attorney open ticket count
router.get('/workload', firmIdValidation, validate, ctrl.getWorkload);

// GET /api/analytics/urgency-trend?firm_id=uuid
// Monthly average AI urgency score
router.get('/urgency-trend', firmIdValidation, validate, ctrl.getUrgencyTrend);

module.exports = router;