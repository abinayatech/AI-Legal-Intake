import {
  API_BASE_URL,
  type Ticket,
} from "@/services/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Brain,
  FileText,
  ListChecks,
  Building2,
  Calendar,
  Mail,
  Download,
  Sparkles,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { UrgencyBadge } from "@/components/urgency-badge";

export const Route = createFileRoute("/_app/tickets/$id")({
  head: () => ({ meta: [{ title: "Matter detail — Lex Triage" }] }),
  component: TicketDetailPage,
});

type DocFile = {
  /** Filename as stored in Storage (e.g. "1718123456789-contract.pdf") */
  storageName: string;
  /** Human-readable name — the timestamp prefix stripped off */
  displayName: string;
  publicUrl: string;
  ext: string;
};

// Strip the `${timestamp}-` prefix added by intake.tsx.
function toDisplayName(storageName: string): string {
  return storageName.replace(/^\d+-/, "");
}

function TicketDetailPage() {
  const { id } = Route.useParams();
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<DocFile[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // ── Load ticket ────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (error) setError(error.message);
      setTicket(data as Ticket | null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, supabase]);

  // ── Load documents from ticket.documents[] ─────────────────────────
  // Files are stored flat: `${Date.now()}-${originalName}` (see intake.tsx).
  // We read the filenames from the ticket row and derive public URLs.
  useEffect(() => {
    if (!ticket) return;

    const fileNames: string[] = Array.isArray(ticket.documents)
      ? (ticket.documents as string[])
      : [];

    if (fileNames.length === 0) {
      setDocuments([]);
      return;
    }

    setDocsLoading(true);

    const resolved: DocFile[] = fileNames.map((storageName) => {
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(storageName);

      const name = toDisplayName(storageName);
      const ext = name.split(".").pop()?.toUpperCase() ?? "FILE";

      return {
        storageName,
        displayName: name,
        publicUrl: urlData?.publicUrl ?? "",
        ext,
      };
    });

    setDocuments(resolved);
    setDocsLoading(false);
  }, [ticket, supabase]);

  async function changeStatus(status: string) {
    if (!ticket) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tickets/${ticket.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok) throw new Error("Failed to update ticket.");
      const updatedTicket = await res.json();
      setTicket(updatedTicket);
    } catch (err) {
      console.error(err);
      alert("Unable to update ticket status.");
    }
  }

  const suggested = Array.isArray(ticket?.suggested_documents)
    ? ticket.suggested_documents
    : [];

  const nextActions = Array.isArray(ticket?.next_actions)
    ? ticket.next_actions
    : [];

  if (loading) return <DetailSkeleton />;

  if (error) {
    return <div className="p-8 text-sm text-destructive">{error}</div>;
  }

  if (!ticket) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Ticket not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All tickets
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
      </div>

      {/* Title card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-foreground">
              #{String(ticket.id).slice(0, 8)}
            </span>
            <span>·</span>
            <span>{ticket.category ?? "Uncategorized"}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl text-foreground">
            {ticket.name ?? "Unknown client"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              {ticket.email ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {ticket.created_at
                ? new Date(ticket.created_at).toLocaleString()
                : "—"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UrgencyBadge urgency={ticket.urgency} />
          <select
            value={ticket.status ?? "open"}
            onChange={(e) => changeStatus(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          >
            <option value="open">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-6 lg:col-span-2">
          <Panel icon={Brain} title="Client statement">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {ticket.description ?? "—"}
            </p>
          </Panel>

          <Panel icon={Brain} title="AI executive summary">
            {ticket.summary ? (
              <p className="text-sm leading-relaxed text-foreground/90">
                {ticket.summary}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No executive summary was generated for this matter.
              </p>
            )}
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
              <ul className="space-y-2">
                {nextActions.map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Counsel will define next actions during review.
              </p>
            )}
          </Panel>

          {/* ── Documents panel ────────────────────────────────────── */}
          <Panel icon={FolderOpen} title="Uploaded documents">
            {docsLoading ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-surface-elevated"
                  />
                ))}
              </div>
            ) : documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.storageName}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/70 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        {doc.ext}
                      </span>
                      <p className="truncate text-sm text-foreground">
                        {doc.displayName}
                      </p>
                    </div>
                    {doc.publicUrl && (
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={doc.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" /> View
                        </a>
                        <a
                          href={doc.publicUrl}
                          download={doc.displayName}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No documents have been uploaded for this matter.
              </p>
            )}
          </Panel>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface/50 p-5">
            <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Triage scoring
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <KV k="Category" v={ticket.category ?? "—"} />
              <KV k="Urgency" v={ticket.urgency ?? "—"} />
              <KV
                k="Confidence"
                v={
                  typeof ticket.confidence === "number"
                    ? `${Math.round(ticket.confidence * 100)}%`
                    : "Not Available"
                }
              />
              <KV k="Status" v={ticket.status ?? "open"} />
            </dl>
          </div>

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
              <p className="text-sm italic text-muted-foreground">
                No documents suggested.
              </p>
            )}
          </Panel>

          <Panel icon={Building2} title="Recommended department">
            <p className="text-sm text-foreground">
              {ticket.recommended_department || "General Legal Review"}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {k}
      </dt>
      <dd className="text-foreground">{v}</dd>
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
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="h-6 w-32 animate-pulse rounded bg-surface-elevated" />
      <div className="h-32 animate-pulse rounded-2xl bg-surface-elevated" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-96 animate-pulse rounded-2xl bg-surface-elevated lg:col-span-2" />
        <div className="h-96 animate-pulse rounded-2xl bg-surface-elevated" />
      </div>
    </div>
  );
}
