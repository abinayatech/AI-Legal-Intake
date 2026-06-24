import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  User,
  Scale,
} from "lucide-react";
import { Brand } from "../components/brand";
import { submitIntake } from "../services/api";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "New Intake — Lex Triage" },
      {
        name: "description",
        content:
          "Describe a legal matter and route it to the right desk with AI triage.",
      },
    ],
  }),
  component: IntakePage,
});

const MATTER_TYPES = [
  "Contract",
  "Employment",
  "Property",
  "Dispute",
  "Compliance",
  "Other",
];

const STEPS = [
  { n: 1, t: "Client", icon: User },
  { n: 2, t: "Matter", icon: Scale },
  { n: 3, t: "Description", icon: FileText },
  { n: 4, t: "Documents", icon: Upload },
  { n: 5, t: "Review", icon: Sparkles },
] as const;

function IntakePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    matterType: "",
    description: "",
    files: [] as File[],
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return form.name.trim() && form.email.trim();
    if (step === 2) return Boolean(form.matterType);
    if (step === 3) return form.description.trim().length > 20;
    return true;
  };

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      // Preserved 1:1 payload from original IntakeForm.jsx
      const data = await submitIntake({
        name: form.name,
        email: form.email,
        description: form.description,
      });
      sessionStorage.setItem("lex.lastResult", JSON.stringify(data));
      navigate({ to: "/result" });
    } catch (e) {
      setError(
        (e as Error).message ||
          "Could not process your request. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Brand />
          <Link
            to="/"
            className="text-xs text-muted-foreground transition hover:text-foreground"
          >
            ← Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        {/* Stepper */}
        <ol className="mb-10 grid grid-cols-5 gap-2">
          {STEPS.map((s) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <li key={s.n} className="flex flex-col items-center gap-2">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border text-xs transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : done
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                </div>
                <span
                  className={`hidden text-[10px] uppercase tracking-[0.14em] sm:block ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.t}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl glass-strong p-8 sm:p-10">
          {step === 1 && (
            <StepShell
              title="Tell us about you"
              sub="Your contact details so counsel can reach you."
            >
              <Field
                label="Full name"
                value={form.name}
                onChange={(v) => update("name", v)}
                placeholder="e.g. Priya Sharma"
                required
              />
              <Field
                label="Email address"
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="priya@email.com"
                required
              />
              <Field
                label="Phone (optional)"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                placeholder="+1 (555) 000-0000"
              />
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              title="What kind of matter?"
              sub="Pick the area that best fits — AI will refine it."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {MATTER_TYPES.map((m) => {
                  const active = form.matterType === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update("matterType", m)}
                      className={`rounded-xl border px-4 py-4 text-left text-sm transition ${
                        active
                          ? "border-primary bg-primary/10 text-foreground shadow-[var(--shadow-glow)]"
                          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
                      }`}
                    >
                      <Scale className="mb-2 h-4 w-4 text-primary" />
                      {m}
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              title="Describe the situation"
              sub="Plain language — facts, parties, dates. The more detail, the better the triage."
            >
              <textarea
                rows={9}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="e.g. My employer terminated me without notice after 4 years of service and has refused to pay my final salary..."
                className="w-full resize-none rounded-lg border border-border bg-surface/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                {form.description.length} characters · {form.description.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              title="Attach supporting documents"
              sub="Optional — contracts, letters, screenshots. We'll suggest what's missing after AI review."
            >
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface/60 px-6 py-12 text-center transition hover:bg-surface">
                <Upload className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm text-foreground">Click to upload</div>
                  <div className="text-xs text-muted-foreground">
                    PDF, DOCX, PNG, JPG · up to 20MB each
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    update("files", Array.from(e.target.files ?? []))
                  }
                />
              </label>
              {form.files.length > 0 && (
                <ul className="space-y-2">
                  {form.files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="truncate">{f.name}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </StepShell>
          )}

          {step === 5 && (
            <StepShell
              title="Review &amp; submit"
              sub="Confirm the matter brief — AI will analyze on submit."
            >
              <dl className="grid gap-3 text-sm">
                <Row k="Client" v={form.name || "—"} />
                <Row k="Email" v={form.email || "—"} />
                <Row k="Phone" v={form.phone || "—"} />
                <Row k="Matter type" v={form.matterType || "—"} />
                <Row k="Documents" v={`${form.files.length} attached`} />
              </dl>
              <div className="rounded-lg border border-border bg-surface/70 p-4">
                <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {form.description || "—"}
                </p>
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}
            </StepShell>
          )}

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    Submit for AI triage <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-border bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {k}
      </dt>
      <dd className="text-sm text-foreground">{v}</dd>
    </div>
  );
}