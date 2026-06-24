import { createFileRoute } from "@tanstack/react-router";
import { Bell, Shield, Plug, Palette } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Lex Triage" }] }),
  component: SettingsPage,
});

const sections = [
  { icon: Bell, title: "Notifications", body: "Email + in-app alerts on new high-priority matters." },
  { icon: Shield, title: "Security", body: "Two-factor authentication, session management, audit log." },
  { icon: Plug, title: "Integrations", body: "Clio, MyCase, NetDocuments, custom webhooks." },
  { icon: Palette, title: "Workspace", body: "Branding, default categories, urgency thresholds." },
];

function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Configuration</p>
        <h1 className="mt-1 font-display text-3xl text-foreground">Settings</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-surface/50 p-6 transition hover:border-border-strong">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-primary">
              <s.icon className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-base font-medium text-foreground">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}