import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  ShieldCheck,
  Gauge,
  FileSearch,
  Workflow,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import heroOffice from "../assets/hero-office.jpg";
import { Brand } from "../components/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lex Triage — Enterprise Legal Operations" },
      {
        name: "description",
        content:
          "AI-powered legal intake, triage, and matter operations for modern law firms.",
      },
      { property: "og:title", content: "Lex Triage — Enterprise Legal Operations" },
      {
        property: "og:description",
        content:
          "AI-powered legal intake, triage, and matter operations for modern law firms.",
      },
    ],
  }),
  component: Landing,
});

const stats = [
  { v: "94%", l: "Triage accuracy" },
  { v: "<8s", l: "Avg AI analysis" },
  { v: "12k+", l: "Matters routed" },
  { v: "37", l: "Practice areas" },
];

const features = [
  {
    icon: Brain,
    title: "AI Categorization",
    body: "Natural-language intake auto-routed to the right practice area with confidence scoring.",
  },
  {
    icon: Gauge,
    title: "Urgency Scoring",
    body: "Every matter scored High / Medium / Low with reasoning surfaced for partner review.",
  },
  {
    icon: FileSearch,
    title: "Suggested Documents",
    body: "Recommended evidence checklist generated per matter type — collected before counsel review.",
  },
  {
    icon: Workflow,
    title: "Assignment Workflow",
    body: "Round-robin or rules-based assignment with SLA tracking and escalation paths.",
  },
  {
    icon: ShieldCheck,
    title: "Privileged by Design",
    body: "Row-level security, full audit trail, and client-matter confidentiality baked in.",
  },
  {
    icon: Sparkles,
    title: "Executive Insight",
    body: "Partner-grade dashboards on caseload, intake velocity, and resolution outcomes.",
  },
];

const steps = [
  { n: "01", t: "Client describes the matter", b: "Free-form intake in plain language — no legal jargon required." },
  { n: "02", t: "AI categorizes & scores urgency", b: "Practice area, urgency, and required documents identified in seconds." },
  { n: "03", t: "Routed to the right desk", b: "Matter assigned to the appropriate department with full briefing." },
  { n: "04", t: "Counsel reviews & resolves", b: "Partner approves the brief, advances the workflow, closes the matter." },
];

const faqs = [
  { q: "How accurate is the AI categorization?", a: "Our classifier averages 94% accuracy across 37 practice areas and surfaces a confidence score so reviewers know when to second-check." },
  { q: "Is client data privileged and secure?", a: "All data is encrypted in transit and at rest, with row-level security and a full audit trail. Suitable for ABA Model Rule 1.6 compliance." },
  { q: "Can we integrate with our case management system?", a: "Yes — webhooks and REST APIs are available for Clio, MyCase, NetDocuments, and custom systems." },
  { q: "How long does deployment take?", a: "Most firms are running their first AI-triaged intake within two business days of kickoff." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <StatsStrip />
      <Features />
      <HowItWorks />
      <Testimonial />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl glass-strong px-5 py-3">
        <Brand />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Platform</a>
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#faq" className="transition hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            to="/intake"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            Start intake
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <img
        src={heroOffice}
        alt="Modern law firm office at dusk"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-6 pt-32 pb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Enterprise Legal Operations Platform
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
            AI triage for the
            <br />
            <span className="italic text-primary">modern law firm.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Convert every client inquiry into a categorized, scored, and routed matter
            — automatically. Built for partners, paralegals, and intake teams who refuse
            to lose a billable hour to triage.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/intake"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
            >
              Start a new intake
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface/60 px-5 py-3 text-sm text-foreground backdrop-blur transition hover:bg-surface"
            >
              Sign in to dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="bg-background p-8">
            <div className="font-display text-4xl text-foreground sm:text-5xl">{s.v}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-28">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">The platform</p>
        <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
          Built for the work that matters.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every surface designed for the speed and discretion of a top-tier practice.
        </p>
      </div>
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="group bg-background p-8 transition hover:bg-surface">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-primary">
              <f.icon className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-5 text-lg font-medium text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Workflow</p>
          <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
            From inquiry to assignment in seconds.
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-border bg-background p-6"
            >
              <div className="font-display text-3xl text-primary/70">{s.n}</div>
              <h3 className="mt-4 text-base font-medium text-foreground">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-28 text-center">
      <blockquote className="font-display text-3xl leading-snug text-foreground sm:text-4xl">
        “We routed a quarter of our intake without a paralegal touching it in
        week one. The triage justifications alone are worth the seat.”
      </blockquote>
      <div className="mt-8 text-sm text-muted-foreground">
        Margaret Chen, Managing Partner — Chen &amp; Reyes LLP
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-border bg-surface/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-28 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-4xl text-foreground">
            Common questions from counsel.
          </h2>
        </div>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-background">
          {faqs.map((f, i) => (
            <li key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-surface"
              >
                <span className="text-base text-foreground">{f.q}</span>
                {open === i ? (
                  <Minus className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-elevated via-surface to-background p-12 text-center sm:p-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--ring),transparent_60%)] opacity-40" />
        <div className="relative">
          <h2 className="font-display text-4xl text-foreground sm:text-5xl">
            Bring AI triage to your firm.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Submit a sample matter and see the categorization, urgency score, and
            recommended documents — in under ten seconds.
          </p>
          <Link
            to="/intake"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            Try the intake workflow
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <Brand />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lex Triage. Privileged &amp; confidential.
        </p>
      </div>
    </footer>
  );
}