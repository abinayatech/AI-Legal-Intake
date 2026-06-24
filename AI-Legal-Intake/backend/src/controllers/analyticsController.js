const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');

const getSummary = asyncHandler(async (req, res) => {
  const firmId = req.user.role === 'admin' ? req.query.firm_id : undefined;
  const data = await analyticsService.getSummaryMetrics(firmId);
  res.json(data);
});

const getVolumeTrend = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const firmId = req.query.firm_id;
  const data = await analyticsService.getTicketVolumeTrend(days, firmId);
  res.json(data);
});

const getByClassification = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTicketsByClassification(req.query.firm_id);
  res.json(data);
});

const getWorkload = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAttorneyWorkload(req.query.firm_id);
  res.json(data);
});

const getUrgencyTrend = asyncHandler(async (req, res) => {
  const data = await analyticsService.getUrgencyTrend(req.query.firm_id);
  res.json(data);
});

module.exports = { getSummary, getVolumeTrend, getByClassification, getWorkload, getUrgencyTrend };