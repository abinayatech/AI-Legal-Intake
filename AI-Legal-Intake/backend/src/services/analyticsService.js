const { supabase } = require('../config/supabase');

/**
 * Returns high-level KPI counters for the analytics dashboard.
 * firmId is optional; if provided, results are scoped to that firm.
 */
async function getSummaryMetrics(firmId) {
  const base = supabase.from('tickets').select('id, status, created_at', { count: 'exact', head: false });
  const query = firmId ? base.eq('firm_id', firmId) : base;
  const { data: tickets, error } = await query;
  if (error) throw error;

  const total = tickets.length;
  const open = tickets.filter((t) => ['new', 'in_review', 'pending'].includes(t.status)).length;
  const resolved = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;

  // Avg resolution time in hours (resolved tickets only)
  const { data: resolvedTickets, error: rtError } = await supabase
    .from('tickets')
    .select('created_at, resolved_at')
    .in('status', ['resolved', 'closed'])
    .not('resolved_at', 'is', null);
  if (rtError) throw rtError;

  const avgResolutionHours =
    resolvedTickets.length === 0
      ? null
      : resolvedTickets.reduce((acc, t) => {
          const diff = new Date(t.resolved_at) - new Date(t.created_at);
          return acc + diff / 3_600_000;
        }, 0) / resolvedTickets.length;

  return { total, open, resolved, avgResolutionHours: avgResolutionHours?.toFixed(1) ?? null };
}

/**
 * Returns daily ticket volume over the last `days` days.
 */
async function getTicketVolumeTrend(days = 30, firmId) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  let query = supabase
    .from('tickets')
    .select('created_at')
    .gte('created_at', since.toISOString());
  if (firmId) query = query.eq('firm_id', firmId);

  const { data, error } = await query;
  if (error) throw error;

  // Bucket by date
  const counts = {};
  data.forEach((t) => {
    const day = t.created_at.slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/**
 * Returns ticket counts broken down by legal classification.
 */
async function getTicketsByClassification(firmId) {
  let query = supabase
    .from('ai_analyses')
    .select('classification');
  if (firmId) {
    // Join through intake_submissions → tickets to filter by firm
    query = supabase
      .from('ai_analyses')
      .select('classification, intake_submissions!inner(tickets!inner(firm_id))')
      .eq('intake_submissions.tickets.firm_id', firmId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const counts = {};
  data.forEach((a) => {
    const key = a.classification || 'Unclassified';
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).map(([classification, count]) => ({ classification, count }));
}

/**
 * Returns intake submission counts per attorney for workload visibility.
 */
async function getAttorneyWorkload(firmId) {
  let query = supabase
    .from('tickets')
    .select('assigned_to, profiles!tickets_assigned_to_fkey(name)')
    .not('assigned_to', 'is', null);
  if (firmId) query = query.eq('firm_id', firmId);

  const { data, error } = await query;
  if (error) throw error;

  const counts = {};
  data.forEach((t) => {
    const key = t.profiles?.name || t.assigned_to;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([attorney, ticketCount]) => ({ attorney, ticketCount }))
    .sort((a, b) => b.ticketCount - a.ticketCount);
}

/**
 * Returns average AI urgency score per month over the last 6 months.
 */
async function getUrgencyTrend(firmId) {
  const since = new Date();
  since.setMonth(since.getMonth() - 6);

  const { data, error } = await supabase
    .from('ai_analyses')
    .select('urgency_score, created_at')
    .gte('created_at', since.toISOString())
    .not('urgency_score', 'is', null);
  if (error) throw error;

  const monthly = {};
  data.forEach((a) => {
    const month = a.created_at.slice(0, 7); // YYYY-MM
    if (!monthly[month]) monthly[month] = { total: 0, count: 0 };
    monthly[month].total += a.urgency_score;
    monthly[month].count += 1;
  });

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { total, count }]) => ({ month, avgUrgency: (total / count).toFixed(2) }));
}

module.exports = {
  getSummaryMetrics,
  getTicketVolumeTrend,
  getTicketsByClassification,
  getAttorneyWorkload,
  getUrgencyTrend,
};