import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Filter, Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { useTickets } from "@/lib/tickets-hook";
import { UrgencyBadge, StatusPill } from "@/components/urgency-badge";
import type { Ticket } from "@/services/api";

export const Route = createFileRoute("/_app/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Lex Triage" }] }),
  component: TicketsPage,
});

// Canonical status values — must match the backend/email service exactly
// (see ticketCtrl.js / emailService.js). Filter chips and the per-row
// select both key off these, with STATUS_LABELS for display only.
const STATUSES = ["all", "open", "in_progress", "resolved", "closed"] as const;
type StatusValue = (typeof STATUSES)[number];

const STATUS_LABELS: Record<StatusValue, string> = {
  all: "All",
  open: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function TicketsPage() {
  const { tickets, loading, error, updateStatus } = useTickets();
  const [filter, setFilter] = useState<StatusValue>("all");
  const [q, setQ] = useState("");
  const [updating, setUpdating] = useState<string | number | null>(null);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (q) {
        const hay = `${t.name ?? ""} ${t.email ?? ""} ${t.description ?? ""} ${t.category ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [tickets, filter, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Matter inbox
          </p>
          <h1 className="mt-1 font-display text-3xl text-foreground">Tickets</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search client, matter, description…"
              className="w-72 rounded-lg border border-border bg-surface px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {STATUSES.map((s) => {
          const count =
            s === "all" ? tickets.length : tickets.filter((t) => t.status === s).length;
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {STATUS_LABELS[s]}
              <span className="rounded-full bg-background px-1.5 text-[10px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/40">
        <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] gap-4 border-b border-border bg-surface-elevated/50 px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:grid">
          <div>Client / Matter</div>
          <div>Category</div>
          <div>Urgency</div>
          <div>Created</div>
          <div>Status</div>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li
                key={String(t.id)}
                className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-surface md:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] md:items-center"
              >
                <Link
                  to="/tickets/$id"
                  params={{ id: String(t.id) }}
                  className="min-w-0 group"
                >
                  <div className="truncate text-sm font-medium text-foreground transition group-hover:text-primary">
                    {t.name ?? "Unknown"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.email ?? "—"} · {(t.description ?? "").slice(0, 80)}
                  </div>
                </Link>
                <div className="text-sm text-muted-foreground">
                  {t.category ?? "—"}
                </div>
                <div>
                  <UrgencyBadge urgency={t.urgency} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.created_at
                    ? new Date(t.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </div>
                <div>
                  <select
                    value={t.status ?? "open"}
                    disabled={updating === t.id}
                    onChange={async (e) => {
                      setUpdating(t.id);
                      const { error } = await updateStatus(t.id, e.target.value);
                      setUpdating(null);
                      if (error) alert(error.message ?? "Could not update status.");
                    }}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary/60 focus:outline-none disabled:opacity-50"
                  >
                    <option value="open">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-border">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="grid grid-cols-5 gap-4 px-5 py-4">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-4 animate-pulse rounded bg-surface-elevated" />
          ))}
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-foreground">No tickets match</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Try clearing filters or submitting a new intake.
      </p>
    </div>
  );
}