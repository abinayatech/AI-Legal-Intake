import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import authSide from "../assets/auth-side.jpg";
import { Brand } from "../components/brand";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Lex Triage" },
      {
        name: "description",
        content: "Sign in to the Lex Triage enterprise legal operations console.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Left: editorial image */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authSide}
          alt="Antique legal book"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/50 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Brand />
          <div className="max-w-md">
            <p className="font-display text-3xl leading-snug text-foreground">
              “Justice delayed is justice denied — but justice mis-routed is
              justice forgotten.”
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              — Lex Triage operations principle
            </p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <div className="rounded-2xl glass-strong p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="font-display text-3xl text-foreground">
              Sign in to your firm.
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Access your matter operations console.
            </p>

            {error && (
              <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counsel@firm.com"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={show ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-border bg-surface/70 px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

           <div className="mt-6 space-y-4">

  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <Link to="/" className="hover:text-foreground">
      ← Back to site
    </Link>

    <Link to="/intake" className="hover:text-foreground">
      Submit intake instead →
    </Link>
  </div>

  <p className="mt-6 text-center text-[11px] text-muted-foreground">
  Protected by enterprise-grade encryption. Audit-trail enabled.
</p>

</div>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Protected by enterprise-grade encryption. Audit-trail enabled.
          </p>
        </div>
      </div>
    </div>
  );
}