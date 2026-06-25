// backend/src/controllers/ticketCtrl.js

import supabase from "../db/supabase.js";
import { sendStatusUpdateEmail } from "../services/emailService.js";

export async function getAllTickets(req, res) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
}

export async function updateTicketStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const { data, error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ updateTicketStatus DB error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  // Send client notification — failure must not break the response
  sendStatusUpdateEmail(data).catch((err) =>
    console.error("⚠️ Status update email failed:", err.message)
  );

  return res.json(data);
}