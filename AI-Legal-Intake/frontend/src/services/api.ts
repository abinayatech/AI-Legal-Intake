/**
 * Ported 1:1 from the original repo's frontend/src/services/api.js.
 * Same paths, methods, payload shapes — preserves the backend contract.
 */
import { supabase } from "../lib/supabase";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3001";

/**
 * authFetch
 * Wraps fetch with the current Supabase session's access token attached
 * as a Bearer header. Used for any endpoint behind the `authenticate`
 * middleware (profile, analytics, reports, notifications).
 */
async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${BASE_URL}${path}`, { ...init, headers });
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.error ?? fallback;
  } catch {
    return fallback;
  }
}

export type IntakePayload = {
  name: string;
  email: string;
  phone?: string;
  matterType?: string;
  description: string;
  documents?: string[];
};

export type Ticket = {
  id: string | number;
  name?: string;
  email?: string;
  description?: string;
  category?: string;
  documents?: string[];
phone?: string;
matter_type?: string;
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
  const res = await fetch(`${BASE_URL}/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Could not update status");
  return res.json();
}

export const API_BASE_URL = BASE_URL;

// ── Profile ───────────────────────────────────────────
// Matches backend/src/routes/profile.js (authenticate-gated)

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  avatar_url?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function fetchMyProfile(): Promise<Profile> {
  const res = await authFetch("/api/profile/me");
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not load profile"));
  }
  return res.json();
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<Profile> {
  const res = await authFetch("/api/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not update profile"));
  }
  return res.json();
}

export async function changeMyPassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const res = await authFetch("/api/profile/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not change password"));
  }
  return res.json();
}

// ── Analytics ─────────────────────────────────────────
// Backend contract assumed stable per project brief ("Analytics backend"
// already completed) — adjust the response type if the real shape differs.

export type AnalyticsSummary = {
  byCategory?: Array<{ name: string; high: number; medium: number; low: number }>;
  byStatus?: Array<{ name: string; value: number }>;
  [key: string]: unknown;
};

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await authFetch("/api/analytics");
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not load analytics"));
  }
  return res.json();
}

// ── Reports ───────────────────────────────────────────

export type Report = {
  id: string | number;
  title?: string;
  generated_at?: string;
  [key: string]: unknown;
};

export async function fetchReports(): Promise<Report[]> {
  const res = await authFetch("/api/reports");
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not load reports"));
  }
  return res.json();
}

export async function fetchReportById(reportId: string | number): Promise<Report> {
  const res = await authFetch(`/api/reports/${reportId}`);
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not load report"));
  }
  return res.json();
}

// ── Notifications ─────────────────────────────────────

export type Notification = {
  id: string | number;
  title?: string;
  message?: string;
  read?: boolean;
  created_at?: string;
  [key: string]: unknown;
};

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await authFetch("/api/notifications");
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not load notifications"));
  }
  return res.json();
}

export async function markNotificationRead(
  notificationId: string | number,
): Promise<Notification> {
  const res = await authFetch(`/api/notifications/${notificationId}`, {
    method: "PATCH",
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Could not update notification"));
  }
  return res.json();
}