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

function AnalyticsPage() {
  const { tickets, loading } = useTickets();

  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; high: number; medium: number; low: number }>();
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

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = { New: 0, "In Progress": 0, Resolved: 0 };
    for (const t of tickets) {
      const s = (t.status ?? "New") as string;
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: ["var(--accent)", "var(--primary)", "var(--urgency-low)"][i],
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
        <div className="rounded-2xl border border-border bg-surface/50 p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-foreground">Volume by category &amp; urgency</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--foreground)" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="high" stackId="a" fill="var(--urgency-high)" name="High" />
                <Bar dataKey="medium" stackId="a" fill="var(--urgency-medium)" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="var(--urgency-low)" name="Low" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface/50 p-6">
          <h2 className="text-sm font-medium text-foreground">Status distribution</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byStatus} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="var(--background)">
                  {byStatus.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-xs">
            {byStatus.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.name}
                </span>
                <span className="text-foreground">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {loading && (
        <p className="text-center text-xs text-muted-foreground">Loading analytics…</p>
      )}
      {!loading && tickets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/30 py-12 text-center text-sm text-muted-foreground">
          No data yet. Submit a few intakes to see real analytics.
        </div>
      )}
    </div>
  );
}