import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Sparkles,
  Brain,
  Plus,
  FolderOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTickets } from "@/lib/tickets-hook";
import { UrgencyBadge, StatusPill } from "@/components/urgency-badge";
import { useAuth } from "@/lib/auth-context";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Lex Triage" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { tickets, loading, error } = useTickets();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(
      (t) => t.status === "New" || t.status === "In Progress",
    ).length;
    const high = tickets.filter((t) => t.urgency === "High").length;
    const resolved = tickets.filter((t) => t.status === "Resolved").length;
    return { total, pending, high, resolved };
  }, [tickets]);

  const trend = useMemo(() => buildTrend(tickets), [tickets]);
  const categoryMix = useMemo(() => buildCategoryMix(tickets), [tickets]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-1 font-display text-4xl text-foreground">
            {greetingFor(user?.email ?? "Counsel")}
          </h1>
        </div>
        <Link
          to="/intake"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New intake
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Inbox} label="Total Requests" value={stats.total} loading={loading} accent="text-foreground" />
        <KpiCard icon={Activity} label="Pending Review" value={stats.pending} loading={loading} accent="text-accent" />
        <KpiCard icon={AlertTriangle} label="High Priority" value={stats.high} loading={loading} accent="text-[var(--urgency-high)]" />
        <KpiCard icon={CheckCircle2} label="Completed" value={stats.resolved} loading={loading} accent="text-[var(--urgency-low)]" />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface/50 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Intake velocity</h2>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <span className="text-xs text-muted-foreground">tickets / day</span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matter Categories card — replaces Urgency Mix */}
        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          <h2 className="text-sm font-medium text-foreground">Matter categories</h2>
          <p className="text-xs text-muted-foreground">By ticket count</p>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-surface-elevated" />
                  <div className="h-2 flex-1 animate-pulse rounded bg-surface-elevated" />
                  <div className="h-3 w-6 animate-pulse rounded bg-surface-elevated" />
                </div>
              ))}
            </div>
          ) : categoryMix.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-foreground">No matters yet</p>
              <p className="text-xs text-muted-foreground">Categories will appear once tickets are submitted.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {categoryMix.map(({ category, count, pct }) => (
                <li key={category}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{category}</span>
                    <span className="text-xs font-medium text-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent activity + AI insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface/50 p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
              <p className="text-xs text-muted-foreground">Latest intakes</p>
            </div>
            <Link to="/tickets" className="inline-flex items-center gap-1 text-xs text-primary hover:brightness-110">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <SkeletonRows />
          ) : tickets.length === 0 ? (
            <Empty />
          ) : (
            <ul className="divide-y divide-border">
              {tickets.slice(0, 6).map((t) => (
                <li key={String(t.id)} className="flex items-center gap-3 py-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-elevated text-xs font-semibold text-primary">
                    {(t.name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate font-medium text-foreground">{t.name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="truncate text-xs text-muted-foreground">{t.category ?? "Uncategorized"}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{t.description ?? ""}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <UrgencyBadge urgency={t.urgency} />
                    <StatusPill status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-surface to-surface-elevated p-6 shadow-[var(--shadow-glow)]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
            <Brain className="h-3.5 w-3.5" /> AI Insight
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground">
            {generateInsight(stats)}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Updated just now
          </div>
        </div>
      </div>
    </div>
  );
}

function greetingFor(email: string) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${part}, ${email.split("@")[0]}.`;
}

function generateInsight(s: { total: number; pending: number; high: number }) {
  if (s.total === 0)
    return "No matters yet. Run a sample intake to see AI categorization and urgency scoring in action.";
  if (s.high > 0)
    return `${s.high} high-priority ${s.high === 1 ? "matter" : "matters"} need partner review. Average response time is the strongest predictor of retention — clear these first.`;
  return `${s.pending} ${s.pending === 1 ? "matter is" : "matters are"} awaiting review. Caseload is balanced.`;
}

function buildTrend(tickets: { created_at?: string }[]) {
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { key: d.toISOString().slice(0, 10), day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: 0 };
  });
  const idx = new Map(days.map((d, i) => [d.key, i]));
  for (const t of tickets) {
    if (!t.created_at) continue;
    const k = t.created_at.slice(0, 10);
    if (idx.has(k)) days[idx.get(k)!].count += 1;
  }
  return days;
}

function buildCategoryMix(tickets: { category?: string }[]) {
  const counts = new Map<string, number>();
  for (const t of tickets) {
    const cat = t.category ?? "Uncategorized";
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));
  const max = sorted[0]?.count ?? 1;
  return sorted.map((entry) => ({ ...entry, pct: Math.round((entry.count / max) * 100) }));
}

function KpiCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  loading: boolean;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-surface/50 p-5 transition hover:border-border-strong">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className={`mt-4 font-display text-3xl ${accent}`}>
        {loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-surface-elevated" /> : value}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-border">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-surface-elevated" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-elevated" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-surface-elevated" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background py-12 text-center">
      <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-3 text-sm text-foreground">No matters yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Submit your first intake to populate the workspace.
      </p>
      <Link
        to="/intake"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
      >
        <Plus className="h-3 w-3" /> New intake
      </Link>
    </div>
  );
}
