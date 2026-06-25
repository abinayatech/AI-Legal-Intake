// frontend/src/routes/_app/documents.tsx
//
// Client Directory — lists every client (derived from tickets) with contact
// details, matter category, status, urgency, and a link to the full ticket.
// Uses fetchTickets() from @/services/api — no Supabase Storage involved.

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Layers,
  Search,
  Inbox,
  ArrowRight,
  Mail,
  Phone,
  Tag,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchTickets, type Ticket } from "@/services/api";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Client Directory — Lex Triage" }] }),
  component: ClientDirectoryPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function categoryLabel(t: Ticket): string {
  return t.category || t.matter_type || "General";
}

/** Colour token for the status badge */
function statusStyle(status: string | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "resolved" || s === "completed" || s === "closed")
    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (s === "in progress" || s === "in_progress" || s === "active")
    return "text-sky-400 bg-sky-400/10 border-sky-400/20";
  if (s === "new")
    return "text-violet-400 bg-violet-400/10 border-violet-400/20";
  if (s === "pending" || s === "waiting")
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-muted-foreground bg-surface-elevated border-border";
}

/** Colour token for the urgency badge */
function urgencyStyle(urgency: string | undefined): string {
  const u = (urgency ?? "").toLowerCase();
  if (u === "high" || u === "urgent" || u === "critical")
    return "text-rose-400 bg-rose-400/10 border-rose-400/20";
  if (u === "medium")
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-muted-foreground bg-surface-elevated border-border";
}

/** Initials avatar from a name string */
function initials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Stable hue from a string so each client avatar has a consistent colour */
function avatarHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ClientDirectoryPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTickets();
        if (active) setTickets(data);
      } catch (e: unknown) {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to load clients.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return tickets;
    return tickets.filter(
      (t) =>
        (t.name ?? "").toLowerCase().includes(term) ||
        (t.email ?? "").toLowerCase().includes(term) ||
        (t.phone ?? "").toLowerCase().includes(term) ||
        categoryLabel(t).toLowerCase().includes(term),
    );
  }, [tickets, q]);

  const totalClients = tickets.length;
  const totalMatters = tickets.length; // 1 ticket = 1 matter in this system

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Directory
          </p>
          <h1 className="mt-1 font-display text-3xl text-foreground">
            Client Directory
          </h1>
          {!loading && (
            <p className="mt-1 text-xs text-muted-foreground">
              {totalClients} client{totalClients !== 1 ? "s" : ""} ·{" "}
              {totalMatters} matter{totalMatters !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, phone, or category…"
            className="w-72 rounded-lg border border-border bg-surface px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Stat strip ──────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total Clients"
            value={totalClients}
            accent="text-primary"
          />
          <StatCard
            icon={<Layers className="h-4 w-4" />}
            label="Total Matters"
            value={totalMatters}
            accent="text-sky-400"
          />
        </div>
      )}

      {/* ── Table / cards ───────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface/40">
        {/* Desktop table header (hidden on mobile) */}
        <div className="hidden border-b border-border bg-surface-elevated/60 px-5 py-3 md:grid md:grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr_1fr_1fr_auto] md:gap-4">
          {["Client", "Email", "Phone", "Category", "Status", "Urgency", "Created", ""].map(
            (col) => (
              <span
                key={col}
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col}
              </span>
            ),
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState hasQuery={!!q.trim()} />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((ticket) => (
              <ClientRow key={ticket.id} ticket={ticket} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─── Client row (desktop table + mobile card in one element) ─────────────────

function ClientRow({ ticket }: { ticket: Ticket }) {
  const cat = categoryLabel(ticket);
  const hue = avatarHue(String(ticket.id));

  return (
    <li className="transition hover:bg-surface">
      {/* ── Desktop row ─────────────────────────────────────────────────── */}
      <div className="hidden items-center gap-4 px-5 py-4 md:grid md:grid-cols-[2fr_2fr_1.2fr_1.2fr_1fr_1fr_1fr_auto]">
        {/* Client name + avatar */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
          >
            {initials(ticket.name)}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {ticket.name ?? "—"}
          </span>
        </div>

        {/* Email */}
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{ticket.email ?? "—"}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate">{ticket.phone ?? "—"}</span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5">
          <Tag className="h-3 w-3 shrink-0 text-primary" />
          <span className="truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            {cat}
          </span>
        </div>

        {/* Status */}
        <span
          className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyle(ticket.status)}`}
        >
          {ticket.status?.replace(/_/g, " ") ?? "—"}
        </span>

        {/* Urgency */}
        <span
          className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${urgencyStyle(ticket.urgency)}`}
        >
          {ticket.urgency ?? "—"}
        </span>

        {/* Created date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>{formatDate(ticket.created_at)}</span>
        </div>

        {/* Action */}
        <Link
          to="/tickets/$id"
          params={{ id: String(ticket.id) }}
          className="group flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          View
          <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
        </Link>
      </div>

      {/* ── Mobile card ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4 py-4 md:hidden">
        {/* Top row: avatar + name + action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
            >
              {initials(ticket.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {ticket.name ?? "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {ticket.email ?? "No email"}
              </p>
            </div>
          </div>
          <Link
            to="/tickets/$id"
            params={{ id: String(ticket.id) }}
            className="group flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            View
            <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
          </Link>
        </div>

        {/* Detail chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {ticket.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {ticket.phone}
            </span>
          )}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            {cat}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyle(ticket.status)}`}
          >
            {ticket.status?.replace(/_/g, " ") ?? "No status"}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${urgencyStyle(ticket.urgency)}`}
          >
            {ticket.urgency ?? "No urgency"}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(ticket.created_at)}
          </span>
        </div>
      </div>
    </li>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/40 px-5 py-5">
      <div className={`${accent} flex items-center gap-1.5`}>
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-display text-4xl font-semibold text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface-elevated" />
          <div className="flex flex-1 items-center gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" />
            <div className="h-4 w-40 animate-pulse rounded bg-surface-elevated" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-surface-elevated" />
          </div>
          <div className="h-7 w-16 animate-pulse rounded-lg bg-surface-elevated" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="py-16 text-center">
      <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-foreground">
        {hasQuery ? "No clients match your search." : "No clients on record yet."}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasQuery
          ? "Try a different name, email, phone number, or category."
          : "Clients will appear here once intake tickets are submitted."}
      </p>
    </div>
  );
}
