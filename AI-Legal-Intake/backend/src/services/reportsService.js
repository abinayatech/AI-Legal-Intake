const { supabase } = require('../config/supabase');

/**
 * Fetches a full ticket report with client info, AI analysis, and attorney assignment.
 * Supports filtering by status, date range, attorney, and classification.
 */
async function getTicketReport({ status, fromDate, toDate, assignedTo, classification, firmId }) {
  let query = supabase
    .from('tickets')
    .select(`
      id,
      status,
      priority,
      created_at,
      resolved_at,
      assigned_to,
      profiles!tickets_assigned_to_fkey(name, email),
      intake_submissions!inner(
        id,
        form_data,
        user_id,
        profiles!intake_submissions_user_id_fkey(name, email)
      ),
      ai_analyses(classification, urgency_score, summary)
    `)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);
  if (firmId) query = query.eq('firm_id', firmId);
  if (classification) {
    query = query.eq('ai_analyses.classification', classification);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Intake submission report — all submissions for a date range.
 */
async function getIntakeReport({ fromDate, toDate, firmId }) {
  let query = supabase
    .from('intake_submissions')
    .select(`
      id,
      created_at,
      status,
      form_data,
      profiles!intake_submissions_user_id_fkey(name, email),
      ai_analyses(classification, urgency_score, summary, created_at)
    `)
    .order('created_at', { ascending: false });

  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Generates a flat CSV-friendly array from ticket report data.
 */
function flattenTicketsForCsv(tickets) {
  return tickets.map((t) => ({
    ticket_id: t.id,
    status: t.status,
    priority: t.priority,
    created_at: t.created_at,
    resolved_at: t.resolved_at ?? '',
    client_name: t.intake_submissions?.profiles?.name ?? '',
    client_email: t.intake_submissions?.profiles?.email ?? '',
    attorney_name: t.profiles?.name ?? 'Unassigned',
    attorney_email: t.profiles?.email ?? '',
    ai_classification: t.ai_analyses?.[0]?.classification ?? '',
    ai_urgency_score: t.ai_analyses?.[0]?.urgency_score ?? '',
    ai_summary: t.ai_analyses?.[0]?.summary ?? '',
  }));
}

/**
 * Converts an array of flat objects to a CSV string.
 */
function toCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? '')).join(',')),
  ];
  return lines.join('\r\n');
}

module.exports = { getTicketReport, getIntakeReport, flattenTicketsForCsv, toCsv };