/**
 * Ported 1:1 from the original repo's frontend/src/services/api.js.
 * Same paths, methods, payload shapes — preserves the backend contract.
 */
const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3001";

export type IntakePayload = {
  name: string;
  email: string;
  description: string;
};

export type Ticket = {
  id: string | number;
  name?: string;
  email?: string;
  description?: string;
  category?: string;
  urgency?: "High" | "Medium" | "Low" | string;
  status?: "New" | "In Progress" | "Resolved" | string;
  summary?: string;
  confidence?: number;
  reasoning?: string;
  suggested_documents?: string[];
  recommended_department?: string;
  next_actions?: string[];
  created_at?: string;
  [key: string]: unknown;
};

export type IntakeResponse = {
  message?: string;
  ticket?: Ticket;
} & Partial<Ticket>;

export async function submitIntake(
  formData: IntakePayload,
): Promise<IntakeResponse> {
  const res = await fetch(`${BASE_URL}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
}

export async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(`${BASE_URL}/api/tickets`);
  if (!res.ok) throw new Error("Could not load tickets");
  return res.json();
}

export async function updateTicketStatus(
  ticketId: string | number,
  status: string,
): Promise<Ticket> {
  const res = await fetch(`${BASE_URL}/api/tickets/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Could not update status");
  return res.json();
}

export const API_BASE_URL = BASE_URL;