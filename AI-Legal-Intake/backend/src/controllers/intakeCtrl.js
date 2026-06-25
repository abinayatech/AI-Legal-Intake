// backend/src/controllers/intakeCtrl.js

import supabase from "../db/supabase.js";
import axios from "axios";
import { sendTicketNotification } from "../services/emailService.js";

export async function submitIntake(req, res) {
  try {
    const {
      name,
      email,
      phone,
      matterType,
      description,
      documents,        // string[] | undefined — paths returned by Storage
    } = req.body;

    // ── Validate input ────────────────────────────────────────────────
    if (!name || !email || !description) {
      return res.status(400).json({
        error: "name, email, and description are required.",
      });
    }

    // Normalise documents: always persist a proper array.
    // Never coerce to [] when the caller sent real paths — only fall back
    // to [] when the field was genuinely absent or not an array.
    const documentPaths = Array.isArray(documents) ? documents : [];

    // ── Call AI service for triage ────────────────────────────────────
    let category               = "General";
    let urgency                = "Medium";
    let summary                = "";
    let confidence             = null;
    let suggested_documents    = [];
    let recommended_department = null;
    let next_actions           = [];
    let reasoning              = null;

    try {
      const aiResponse = await axios.post(
        process.env.AI_SERVICE_URL || "http://localhost:8000/classify",
        { description }
      );
      const d = aiResponse.data;
      category               = d.category               || category;
      urgency                = d.urgency                || urgency;
      summary                = d.summary                || summary;
      confidence             = d.confidence             ?? confidence;
      suggested_documents    = Array.isArray(d.suggested_documents)  ? d.suggested_documents  : suggested_documents;
      recommended_department = d.recommended_department || recommended_department;
      next_actions           = Array.isArray(d.next_actions)         ? d.next_actions          : next_actions;
      reasoning              = d.reasoning              || reasoning;
    } catch (aiErr) {
      // AI service is optional — continue without it
      console.warn("⚠️  AI service unavailable, using defaults.");
    }

    // ── Save ticket to Supabase ───────────────────────────────────────
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        name,
        email,
        phone,
        matter_type: matterType,
        description,
        // Always write the array — Supabase will store [] when no files
        // were attached and the real paths when they were.
        documents: documentPaths,

        category,
        urgency,
        summary,
        confidence,
        suggested_documents,
        next_actions,
        recommended_department,
      })
      .select()
      .single();

    if (error) throw error;

    // ── Send email notification ───────────────────────────────────────
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