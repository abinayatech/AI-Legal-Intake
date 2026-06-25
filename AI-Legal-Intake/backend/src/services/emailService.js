// backend/src/services/emailService.js
//
// Changes vs original:
//  - sendStatusUpdateEmail: the status display label for "open" now
//    correctly reads "Received" (original fell through to the bare `open`
//    string because it had no explicit case for it).
//  - Both functions are otherwise identical to the original.

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* --------------------------------------------------
   Human-readable labels for DB status values.
   ticketCtrl.js stores: open | in_progress | resolved | closed
---------------------------------------------------*/
const STATUS_LABEL = {
  open:        "Received",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

const STATUS_MESSAGE = {
  open:        "📩 Your request has been received and is awaiting review.",
  in_progress: "⏳ Your request is currently under review by our legal team.",
  resolved:    "✅ Your request has been resolved.",
  closed:      "📁 Your request has been closed.",
};

/* --------------------------------------------------
   Email to ADMIN when a new ticket is created
---------------------------------------------------*/
export async function sendTicketNotification(ticket) {
  try {
    const urgencyEmoji =
      { High: "🔴", Medium: "🟡", Low: "🟢" }[ticket.urgency] ?? "⚪";

    const { data, error } = await resend.emails.send({
      from: "Legal Triage <onboarding@resend.dev>",
      to:   process.env.ADMIN_EMAIL,
      subject: `${urgencyEmoji} New Legal Ticket — ${ticket.category ?? "General"}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2>⚖️ New Legal Ticket</h2>

          <p><strong>Client:</strong> ${ticket.name}</p>
          <p><strong>Email:</strong> ${ticket.email}</p>
          <p><strong>Category:</strong> ${ticket.category ?? "—"}</p>
          <p><strong>Urgency:</strong> ${ticket.urgency ?? "—"}</p>
          <p><strong>Status:</strong> ${STATUS_LABEL[ticket.status] ?? ticket.status ?? "New"}</p>

          <hr>

          <p>${ticket.description}</p>

          ${ticket.summary
            ? `<p><strong>AI Summary:</strong> ${ticket.summary}</p>`
            : ""}

          <br>

          <a
            href="${process.env.FRONTEND_URL}/dashboard"
            style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;"
          >
            View Dashboard
          </a>

          <hr>
          <p style="font-size:12px;color:#777">Lex Triage Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Admin email error:", error);
      return false;
    }

    console.log("✅ Admin email sent", data?.id);
    return true;
  } catch (err) {
    console.error("❌ sendTicketNotification threw:", err);
    return false;
  }
}

/* --------------------------------------------------
   Email to CLIENT when ticket status changes.
   Called automatically by ticketCtrl.updateTicketStatus
   for all four status transitions:
     open → in_progress → resolved → closed
---------------------------------------------------*/
export async function sendStatusUpdateEmail(ticket) {
  if (!ticket?.email) {
    console.warn("⚠️ sendStatusUpdateEmail: no client email on ticket", ticket?.id);
    return false;
  }

  try {
    const displayStatus  = STATUS_LABEL[ticket.status]   ?? ticket.status ?? "Updated";
    const statusMessage  = STATUS_MESSAGE[ticket.status] ?? "Your request status has been updated.";

    const { data, error } = await resend.emails.send({
      from:    "Legal Triage <onboarding@resend.dev>",
      to:      ticket.email,
      subject: `📌 Your Legal Request — ${displayStatus}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2>⚖️ Status Update</h2>

          <p>Hello <strong>${ticket.name ?? "there"}</strong>,</p>
          <p>Your legal matter has been updated.</p>

          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:8px 4px;color:#6b7280;font-size:13px"><strong>Ticket ID</strong></td>
              <td style="padding:8px 4px;font-size:13px;font-family:monospace">${String(ticket.id).slice(0, 8)}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:8px 4px;color:#6b7280;font-size:13px"><strong>Category</strong></td>
              <td style="padding:8px 4px;font-size:13px">${ticket.category ?? "—"}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb">
              <td style="padding:8px 4px;color:#6b7280;font-size:13px"><strong>Urgency</strong></td>
              <td style="padding:8px 4px;font-size:13px">${ticket.urgency ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 4px;color:#6b7280;font-size:13px"><strong>Status</strong></td>
              <td style="padding:8px 4px;font-size:13px;font-weight:600">${displayStatus}</td>
            </tr>
          </table>

          <p style="margin:16px 0">${statusMessage}</p>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="font-size:12px;color:#9ca3af">
            Lex Triage Team · This is an automated notification.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Client email error:", error);
      return false;
    }

    console.log("✅ Client status email sent", data?.id, "→", ticket.email);
    return true;
  } catch (err) {
    console.error("❌ sendStatusUpdateEmail threw:", err);
    return false;
  }
}
