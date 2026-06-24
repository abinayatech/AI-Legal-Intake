import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, Upload, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — Lex Triage" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vault</p>
        <h1 className="mt-1 font-display text-3xl text-foreground">Document center</h1>
      </div>

      <div className="rounded-2xl border border-dashed border-border-strong bg-surface/40 p-16 text-center">
        <FolderOpen className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-4 font-display text-2xl text-foreground">
          Coming online with your next intake.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Documents uploaded during client intake will appear here, organized by matter,
          with audit-trailed access.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground transition hover:bg-surface">
            <Upload className="h-3.5 w-3.5" /> Upload document
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {["Contracts", "Pleadings", "Correspondence"].map((t) => (
          <div key={t} className="rounded-2xl border border-border bg-surface/40 p-5">
            <FileText className="h-4 w-4 text-primary" />
            <div className="mt-4 text-sm font-medium text-foreground">{t}</div>
            <div className="text-xs text-muted-foreground">0 files</div>
          </div>
        ))}
      </div>
    </div>
  );
}