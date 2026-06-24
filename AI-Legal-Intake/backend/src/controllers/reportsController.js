const reportsService = require('../services/reportsService');
const { asyncHandler } = require('../middleware/errorHandler');

const getTicketReport = asyncHandler(async (req, res) => {
  const { status, from_date: fromDate, to_date: toDate, assigned_to: assignedTo, classification, firm_id: firmId } = req.query;
  const data = await reportsService.getTicketReport({ status, fromDate, toDate, assignedTo, classification, firmId });
  res.json({ count: data.length, data });
});

const getIntakeReport = asyncHandler(async (req, res) => {
  const { from_date: fromDate, to_date: toDate, firm_id: firmId } = req.query;
  const data = await reportsService.getIntakeReport({ fromDate, toDate, firmId });
  res.json({ count: data.length, data });
});

const downloadTicketReportCsv = asyncHandler(async (req, res) => {
  const { status, from_date: fromDate, to_date: toDate, assigned_to: assignedTo, classification, firm_id: firmId } = req.query;
  const data = await reportsService.getTicketReport({ status, fromDate, toDate, assignedTo, classification, firmId });
  const flat = reportsService.flattenTicketsForCsv(data);
  const csv = reportsService.toCsv(flat);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-report-${Date.now()}.csv"`);
  res.send(csv);
});

module.exports = { getTicketReport, getIntakeReport, downloadTicketReportCsv };