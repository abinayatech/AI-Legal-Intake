import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
  Building2,
  ListChecks,
} from "lucide-react";
import { Brand } from "../components/brand";
import { UrgencyBadge } from "../components/urgency-badge";
import type { IntakeResponse, Ticket } from "../services/api";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "AI Triage Result — Lex Triage" },
      {
        name: "description",
        content: "AI analysis, urgency scoring, and suggested next actions.",
      },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const [result, setResult] = useState<IntakeResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("lex.lastResult");
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch {
        /* noop */
      }
    }
  }, []);

  const ticket: Ticket = (result?.ticket || result || {}) as Ticket;
  const suggested = Array.isArray(ticket.suggested_documents)
    ? ticket.suggested_documents
    : [];
  const nextActions = Array.isArray(ticket.next_actions)
    ? ticket.next_actions
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Brand />
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <Link
              to="/intake"
              className="text-xs text-muted-foreground transition hover:text-foreground"
            >
              ← New intake
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI Workspace
        </div>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
          Matter analysis complete.
        </h1>
        {ticket.id && (
          <p className="mt-2 text-sm text-muted-foreground">
            Ticket reference{" "}
            <span className="font-mono text-foreground">{String(ticket.id)}</span>
          </p>
        )}

        {/* Top KPI row */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          <Kpi
            label="Category"
            value={ticket.category ?? "General"}
            sub="AI-classified"
          />
          <div className="bg-background p-6">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Urgency
            </div>
            <div className="mt-3">
              <UrgencyBadge urgency={ticket.urgency} className="text-sm" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Triage priority
            </div>
          </div>
          <Kpi
            label="Confidence"
            value={
              typeof ticket.confidence === "number"
                ? `${Math.round(ticket.confidence * 100)}%`
                : "—"
            }
            sub="Model certainty"
          />
        </div>

        {/* Main two-col */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel icon={Brain} title="Executive summary">
              <p className="text-sm leading-relaxed text-foreground/90">
                {ticket.summary ??
                  "The model did not return a summary for this matter. The raw description has been preserved on the ticket for counsel review."}
              </p>
            </Panel>

            {ticket.reasoning && (
              <Panel icon={Sparkles} title="AI reasoning">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ticket.reasoning}
                </p>
              </Panel>
            )}

            <Panel icon={ListChecks} title="Suggested next actions">
              {nextActions.length ? (
                <ul className="space-y-2.5">
                  {nextActions.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-foreground/90"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine text="Counsel will define next actions on review." />
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel icon={FileText} title="Suggested documents">
              {suggested.length ? (
                <ul className="space-y-2">
                  {suggested.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm"
                    >
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyLine text="No specific documents suggested." />
              )}
            </Panel>

            <Panel icon={Building2} title="Recommended department">
              <p className="text-sm text-foreground">
                {ticket.recommended_department ?? "Routing pending counsel review."}
              </p>
            </Panel>

            <div className="rounded-2xl border border-border bg-surface/50 p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-[var(--urgency-low)]" />
                Ticket created &amp; queued for review.
              </div>
            </div>

            <Link
              to="/intake"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition hover:bg-surface-elevated"
            >
              <ArrowLeft className="h-4 w-4" /> Submit another matter
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-background p-6">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl capitalize text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Brain;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-sm italic text-muted-foreground">{text}</p>;
}