import { cn } from "@/lib/utils";
import { Flame, AlertTriangle, CheckCircle2 } from "lucide-react";

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency?: string | null;
  className?: string;
}) {
  const u = (urgency ?? "Medium").toLowerCase();
  const map: Record<
    string,
    { label: string; cls: string; Icon: typeof Flame }
  > = {
    high: {
      label: "High",
      cls: "text-[var(--urgency-high)] bg-[color-mix(in_oklab,var(--urgency-high)_15%,transparent)] border-[color-mix(in_oklab,var(--urgency-high)_30%,transparent)]",
      Icon: Flame,
    },
    medium: {
      label: "Medium",
      cls: "text-[var(--urgency-medium)] bg-[color-mix(in_oklab,var(--urgency-medium)_15%,transparent)] border-[color-mix(in_oklab,var(--urgency-medium)_30%,transparent)]",
      Icon: AlertTriangle,
    },
    low: {
      label: "Low",
      cls: "text-[var(--urgency-low)] bg-[color-mix(in_oklab,var(--urgency-low)_15%,transparent)] border-[color-mix(in_oklab,var(--urgency-low)_30%,transparent)]",
      Icon: CheckCircle2,
    },
  };
  const m = map[u] ?? map.medium;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        m.cls,
        className,
      )}
    >
      <m.Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

export function StatusPill({ status }: { status?: string | null }) {
  const s = status ?? "New";
  const map: Record<string, string> = {
    New: "bg-accent/10 text-accent border-accent/30",
    "In Progress": "bg-primary/10 text-primary border-primary/30",
    Resolved:
      "bg-[color-mix(in_oklab,var(--urgency-low)_12%,transparent)] text-[var(--urgency-low)] border-[color-mix(in_oklab,var(--urgency-low)_25%,transparent)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[s] ?? map.New,
      )}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {s}
    </span>
  );
}