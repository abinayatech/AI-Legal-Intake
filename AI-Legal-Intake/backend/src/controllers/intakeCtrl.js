// backend/src/controllers/intakeCtrl.js

import supabase from "../db/supabase.js";
import axios from "axios";
import { sendTicketNotification } from "../services/emailService.js";

export async function submitIntake(req, res) {
  try {
    const { name, email, description } = req.body;

    // ── Validate input ────────────────────────────────
    if (!name || !email || !description) {
      return res.status(400).json({
        error: "name, email, and description are required."
      });
    }

    // ── Call AI service for triage ────────────────────
    let category = "General";
    let urgency  = "Medium";
    let summary  = "";

    try {
      const aiResponse = await axios.post(
        process.env.AI_SERVICE_URL || "http://localhost:8000/classify",
        { description }
      );
      category = aiResponse.data.category || category;
      urgency  = aiResponse.data.urgency  || urgency;
      summary  = aiResponse.data.summary  || summary;
    } catch (aiErr) {
      // AI service is optional — continue without it
      console.warn("⚠️  AI service unavailable, using defaults.");
    }

    // ── Save ticket to Supabase ───────────────────────
    const { data, error } = await supabase
      .from("tickets")
      .insert([{
        name,
        email,
        description,
        category,
        urgency,
        summary,
        status: "New",
      }])
      .select()
      .single();

    if (error) throw error;

    // ── Send email notification ───────────────────────
    // Runs after ticket is saved — email failure won't break the response
    sendTicketNotification(data).catch((err) =>
      console.error("⚠️ Email notification failed:", err.message)
    );

    return res.status(201).json({
      message: "Ticket created successfully.",
      ticket: data,
    });

  } catch (err) {
    console.error("❌ intakeCtrl error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}