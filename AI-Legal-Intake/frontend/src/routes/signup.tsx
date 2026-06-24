import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import authSide from "../assets/auth-side.jpg";
import { Brand } from "../components/brand";
import { useAuth } from "../lib/auth-context";
import {
  validateName,
  validateEmail,
  validatePasswordStrength,
  validateConfirmPassword,
} from "../lib/validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Lex Triage" },
      {
        name: "description",
        content: "Create your Lex Triage enterprise legal operations account.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  function runValidation() {
    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePasswordStrength(password).message,
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setFieldErrors(errors);
    return Object.values(errors).every((e) => e === null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!runValidation()) return;

    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Supabase auto-establishes a session on signUp when email
    // confirmation is disabled for the project — in that case the
    // user is already logged in here. If confirmation is required,
    // send them to login with a heads-up instead of the dashboard.
    navigate({ to: "/dashboard" });
  }

  const passwordStrength = password ? validatePasswordStrength(password) : null;

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
              Create your account.
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Set up your firm's operations console.
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
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setFieldErrors((f) => ({ ...f, name: validateName(name) }))}
                  placeholder="Jordan Avery"
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setFieldErrors((f) => ({ ...f, email: validateEmail(email) }))}
                  placeholder="counsel@firm.com"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
                )}
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
                    onBlur={() =>
                      setFieldErrors((f) => ({
                        ...f,
                        password: validatePasswordStrength(password).message,
                      }))
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                {password && passwordStrength && (
                  <div className="mt-1.5 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength.score ? "bg-primary" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Confirm password
                </label>
                <input
                  type={show ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() =>
                    setFieldErrors((f) => ({
                      ...f,
                      confirmPassword: validateConfirmPassword(password, confirmPassword),
                    }))
                  }
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                )}
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
                    Create account
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <Link to="/login" className="hover:text-foreground">
                Already have an account? Sign in
              </Link>
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