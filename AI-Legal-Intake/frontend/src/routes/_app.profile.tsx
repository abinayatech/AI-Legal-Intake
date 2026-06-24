import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Mail, Shield, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Lex Triage" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</p>
        <h1 className="mt-1 font-display text-3xl text-foreground">Profile</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface/50 p-8">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-semibold text-primary-foreground">
            {(user?.email ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl text-foreground">
              {user?.email?.split("@")[0] ?? "Counsel"}
            </div>
            <div className="text-sm text-muted-foreground">Administrator</div>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field icon={Mail} label="Email" value={user?.email ?? "—"} />
          <Field icon={Shield} label="Role" value="Administrator" />
          <Field icon={Calendar} label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
          <Field icon={Shield} label="User ID" value={user?.id ?? "—"} mono />
        </dl>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-2 truncate text-sm text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </div>
    </div>
  );
}