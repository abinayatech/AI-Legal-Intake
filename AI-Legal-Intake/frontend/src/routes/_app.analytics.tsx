import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTickets } from "@/lib/tickets-hook";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Lex Triage" }] }),
  component: AnalyticsPage,
});

// ── Status values as stored in the DB ─────────────────────────────────────
// ticketCtrl.js accepts: "open" | "in_progress" | "resolved" | "closed"
// The original analytics page bucketed by "New" / "In Progress" / "Resolved"
// (the UI display labels), so every status count was always 0.
const STATUS_DISPLAY: Record<string, string> = {
  open: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function AnalyticsPage() {
  const { tickets, loading } = useTickets();

  // Volume by category, stacked by urgency
  const byCategory = useMemo(() => {
    const map = new Map<
      string,
      { name: string; high: number; medium: number; low: number }
    >();
    for (const t of tickets) {
      const k = (t.category ?? "Uncategorized") as string;
      const row = map.get(k) ?? { name: k, high: 0, medium: 0, low: 0 };
      if (t.urgency === "High") row.high += 1;
      else if (t.urgency === "Low") row.low += 1;
      else row.medium += 1;
      map.set(k, row);
    }
    return Array.from(map.values()).slice(0, 8);
  }, [tickets]);

  // Distribution by status — keyed on actual DB values
  const byStatus = useMemo(() => {
    const counts: Record<string, number> = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };
    for (const t of tickets) {
      const s = (t.status ?? "open") as string;
      if (s in counts) {
        counts[s] += 1;
      } else {
        // Unknown status — bucket under "open" rather than silently drop
        counts["open"] += 1;
      }
    }
    return Object.entries(counts)
      // Only show statuses that have at least one ticket, to keep the
      // pie chart readable. Remove the filter if you always want all slices.
      .filter(([, value]) => value > 0)
      .map(([status, value], i) => ({
        name: STATUS_DISPLAY[status] ?? status,
        value,
        color: (
          ["var(--accent)", "var(--primary)", "var(--urgency-low)", "var(--muted-foreground)"] as const
        )[i % 4],
      }));
  }, [tickets]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Reports
        </p>
        <h1 className="mt-1 font-display text-3xl text-foreground">
          Analytics &amp; insights
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Volume by category & urgency */}
        <div className="rounded-2xl border border-border bg-surface/50 p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-foreground">
            Volume by category &amp; urgency
          </h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="high"
                  stackId="a"
                  fill="var(--urgency-high)"
                  name="High"
                />
                <Bar
                  dataKey="medium"
                  stackId="a"
                  fill="var(--urgency-medium)"
                  name="Medium"
                />
                <Bar
                  dataKey="low"
                  stackId="a"
                  fill="var(--urgency-low)"
                  name="Low"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status distribution */}
        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          <h2 className="text-sm font-medium text-foreground">
            Status distribution
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="var(--background)"
                >
                  {byStatus.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-xs">
            {byStatus.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />{" "}
                  {s.name}
                </span>
                <span className="text-foreground">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {loading && (
        <p className="text-center text-xs text-muted-foreground">
          Loading analytics…
        </p>
      )}
      {!loading && tickets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/30 py-12 text-center text-sm text-muted-foreground">
          No data yet. Submit a few intakes to see real analytics.
        </div>
      )}
    </div>
  );
}
