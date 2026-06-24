// backend/src/services/emailService.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketNotification(ticket) {
  try {
    const urgencyEmoji = {
      High:   "🔴",
      Medium: "🟡",
      Low:    "🟢",
    }[ticket.urgency] || "⚪";

    const { data, error } = await resend.emails.send({
      from:    "Legal Triage <onboarding@resend.dev>",
      to:      process.env.ADMIN_EMAIL,
      subject: `${urgencyEmoji} New Legal Ticket — ${ticket.category} [${ticket.urgency} Urgency]`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">

          <!-- Header -->
          <div style="background: #1a202c; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 1.4rem;">
              ⚖️ New Legal Ticket Received
            </h1>
          </div>

          <!-- Body -->
          <div style="background: #f7fafc; padding: 24px; border: 1px solid #e2e8f0;">

            <!-- Urgency Banner -->
            <div style="
              background: ${ticket.urgency === "High" ? "#fff5f5" : ticket.urgency === "Medium" ? "#fffbeb" : "#f0fff4"};
              border: 1px solid ${ticket.urgency === "High" ? "#fc8181" : ticket.urgency === "Medium" ? "#fcd34d" : "#68d391"};
              color: ${ticket.urgency === "High" ? "#c53030" : ticket.urgency === "Medium" ? "#b45309" : "#276749"};
              padding: 10px 16px;
              border-radius: 6px;
              margin-bottom: 20px;
              font-weight: 600;
            ">
              ${urgencyEmoji} ${ticket.urgency} Urgency — ${ticket.category}
            </div>

            <!-- Ticket Details -->
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; color: #718096; width: 130px; font-weight: 600;">Client</td>
                <td style="padding: 10px; color: #1a202c;">${ticket.name}</td>
              </tr>
              <tr style="background: #edf2f7;">
                <td style="padding: 10px; color: #718096; font-weight: 600;">Email</td>
                <td style="padding: 10px;">
                  <a href="mailto:${ticket.email}" style="color: #3b82f6;">${ticket.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #718096; font-weight: 600;">Category</td>
                <td style="padding: 10px; color: #1a202c;">📁 ${ticket.category}</td>
              </tr>
              <tr style="background: #edf2f7;">
                <td style="padding: 10px; color: #718096; font-weight: 600;">Status</td>
                <td style="padding: 10px; color: #1a202c;">🆕 ${ticket.status}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #718096; font-weight: 600; vertical-align: top;">Description</td>
                <td style="padding: 10px; color: #1a202c; line-height: 1.6;">${ticket.description}</td>
              </tr>
              ${ticket.summary ? `
              <tr style="background: #edf2f7;">
                <td style="padding: 10px; color: #718096; font-weight: 600; vertical-align: top;">AI Summary</td>
                <td style="padding: 10px; color: #1a202c; line-height: 1.6;">${ticket.summary}</td>
              </tr>
              ` : ""}
            </table>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 24px;">
              
                href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard"
                style="
                  background: #3b82f6;
                  color: #fff;
                  padding: 12px 28px;
                  border-radius: 8px;
                  text-decoration: none;
                  font-weight: 600;
                  display: inline-block;
                "
              >
                View Dashboard →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #edf2f7; padding: 16px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #a0aec0; font-size: 0.8rem; margin: 0;">
              Legal Triage System — Automated Notification
            </p>
          </div>

        </div>
      `,
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return false;
    }

    console.log("✅ Email sent successfully:", data?.id);
    return true;

  } catch (err) {
    console.error("❌ emailService error:", err.message);
    return false;
  }
}