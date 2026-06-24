import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import type { Ticket } from "@/services/api";

/**
 * Reads tickets from Supabase directly — preserved from the original
 * Dashboard.jsx implementation.
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

  const updateStatus = useCallback(
    async (id: Ticket["id"], status: string) => {
      const { error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", id);
      if (error) return { error };
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { error: null };
    },
    [supabase],
  );

  return { tickets, loading, error, refetch: fetchTickets, updateStatus };
}