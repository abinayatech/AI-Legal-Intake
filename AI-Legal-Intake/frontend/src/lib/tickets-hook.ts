import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import { API_BASE_URL, type Ticket } from "@/services/api";

/**
 * Reads tickets from Supabase directly — preserved from the original
 * Dashboard.jsx implementation.
 *
 * updateStatus goes through the backend (PATCH /api/tickets/:id/status)
 * rather than writing to Supabase directly. The backend route is what
 * triggers the client status-update email (see ticketCtrl.js) — a direct
 * Supabase write from the browser bypasses that entirely and the client
 * never gets notified.
 */
export function useTickets() {
  const { supabase } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setTickets((data as Ticket[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateStatus = useCallback(async (id: Ticket["id"], status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.error ?? "Could not update status";
        return { error: { message } };
      }
      const updated = (await res.json()) as Ticket;
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      );
      return { error: null };
    } catch (err) {
      return {
        error: { message: err instanceof Error ? err.message : "Network error" },
      };
    }
  }, []);

  return { tickets, loading, error, refetch: fetchTickets, updateStatus };
}