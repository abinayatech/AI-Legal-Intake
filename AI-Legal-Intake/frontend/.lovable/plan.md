## Reality check before we start

This Lovable project is a TanStack Start (Cloudflare Workers) template — it cannot run your Express + Python backend, and it uses a different router than your repo (`@tanstack/react-router`, not `react-router-dom`). To honor your "do not modify backend / API / DB / auth" rule, I will:

- **Keep your backend untouched.** No Express or Python code changes.
- **Re-implement the frontend in this project's stack** (TanStack Start + Tailwind v4 + shadcn) while preserving every API call, payload shape, Supabase auth flow, and ticket workflow from the files you uploaded.
- Point the rebuilt UI at your backend via `VITE_API_URL` (same env var you already use) and at your Supabase project via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (same names).

You will deploy/run your existing Express + Python services as-is; this UI just talks to them.

## What I analyzed from your uploads

- `App.jsx` — routes: `/login`, `/` (IntakeForm), `/result`, wildcard → `/`. `ProtectedRoute` exists but isn't applied to `/`.
- `AuthContext.jsx` — Supabase client + `signIn` / `signOut` / session listener. **Preserved exactly.**
- `api.js` — `submitIntake`, `fetchTickets`, `updateStatus` against `${VITE_API_URL}/api/intake`, `/api/tickets`, `/api/tickets/:id`. **Preserved exactly — same paths, methods, payloads.**
- `IntakeForm.jsx` — fields: `name`, `email`, `description`. Posts to `submitIntake`, renders `<TriageResult>` on success.
- `TriageResult.jsx` — reads `result.ticket || result`, fields used: `category`, `urgency`, `summary`, `id`.
- `Dashboard.jsx` — reads Supabase `tickets` table directly (`select *`, `order created_at desc`), updates `status` via Supabase. Statuses: `New | In Progress | Resolved`. Urgency: `High | Medium | Low`.
- `Login.jsx` — email/password via `signIn`, then `navigate("/dashboard")`.

Missing in your repo vs. the official requirements: document upload, suggested-documents UI, AI-confidence/reasoning surfaces, multi-step intake wizard, analytics charts, admin assignment workflow UI. The redesign will add UI shells for these that bind to fields if your API returns them, and degrade gracefully if not.

## Route map (TanStack Start, mirrors your URLs + adds enterprise surfaces)

```
src/routes/
  __root.tsx                 root shell + providers
  index.tsx                  marketing landing page
  intake.tsx                 client intake wizard (replaces "/")
  result.tsx                 AI triage result (your "/result")
  login.tsx                  split-screen login
  _app.tsx                   authed shell (sidebar + topbar), gates on Supabase session
  _app.dashboard.tsx         enterprise dashboard (stats, charts, activity)
  _app.tickets.tsx           ticket management table (filter/search/pagination)
  _app.tickets.$id.tsx       ticket detail + AI workspace + status workflow
  _app.analytics.tsx         reports & analytics
  _app.documents.tsx         document center (shell)
  _app.profile.tsx           profile
  _app.settings.tsx          settings
```

Your original `/` was the intake form. To match the requirement for a landing page, `/` becomes the marketing landing and the intake moves to `/intake`. Unauthenticated users are redirected from `_app/*` to `/login`; after login they land on `/dashboard`.

## Preserved behavior (verbatim contract)

- `AuthContext` is ported 1:1 to `src/lib/auth-context.tsx`, same Supabase client init, same `signIn` / `signOut` / session listener.
- `src/services/api.ts` keeps the exact three functions and URLs from your `api.js`.
- Dashboard ticket reads/updates continue to go through the Supabase client (matches your current implementation) — no schema or RLS assumptions changed.
- Urgency vocabulary (`High/Medium/Low`) and status vocabulary (`New/In Progress/Resolved`) preserved.
- Intake form submits `{ name, email, description }` (wizard collects extras but only sends these to `submitIntake` unless your API accepts more — extras stay client-side until you confirm the payload).

## Visual design

Dark enterprise theme (Harvey AI / Linear / Vercel register): near-black background (`oklch(0.16 0.02 260)`), elevated glass cards with `backdrop-blur`, hairline borders, restrained gold/blue accent. Typography: Instrument Serif for display headings + Inter for UI (loaded via `<link>` in `__root.tsx`, never `@import` in CSS per Tailwind v4 rules). Motion via the `tailwindcss-animate` utilities already present; small Framer-Motion-style entrances. All colors as semantic tokens in `src/styles.css` (`--background`, `--primary`, `--accent`, `--surface`, `--ring`, urgency tokens). No hardcoded color classes.

Landing page: sticky transparent nav, full-bleed legal-office hero image with dark overlay + glass hero card, animated stat counters, features grid, AI capabilities, how-it-works timeline, testimonials, FAQ accordion, footer.

Auth: split-screen with editorial legal imagery on the left, glass card on the right.

Authed shell: collapsible left sidebar (shadcn `Sidebar`) + topbar with search, notifications, user menu.

Dashboard: 4 KPI cards (Total / Pending / High Priority / Resolved), recent activity feed, urgency breakdown chart (Recharts), AI insights card, quick actions.

Ticket detail / AI workspace: executive summary, category, urgency score, confidence, AI reasoning, suggested documents checklist, recommended department, next actions, ticket metadata, status switcher, "Export PDF" (client-side `window.print` styled). All fields render from whatever the ticket row contains; missing fields show empty-state copy, never crash.

Intake wizard: 6 steps (Client Info → Legal Matter → Description → Documents → AI Review → Confirm) with progress bar, validated per step. Submission still calls `submitIntake({ name, email, description })`.

## Technical implementation

- Add deps: `@supabase/supabase-js`, `recharts`, `@fontsource/inter`, `@fontsource/instrument-serif` (or `<link>` Google Fonts in root head per the v4 rule).
- New files: `src/lib/auth-context.tsx`, `src/lib/supabase.ts`, `src/services/api.ts`, `src/components/app-sidebar.tsx`, `src/components/site-nav.tsx`, plus the route files above and small primitives (`StatCard`, `UrgencyBadge`, `StatusPill`, `EmptyState`, `KpiTile`).
- `src/routes/__root.tsx` mounts `AuthProvider` inside `QueryClientProvider`, adds Inter/Instrument-Serif `<link>` tags in `head()`, and keeps `<Outlet />`.
- `_app.tsx` is the auth gate (Supabase session check → redirect to `/login` if missing) and renders the sidebar + `<Outlet />`.
- Env vars: you'll set `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in this project's secrets so the Supabase + Express calls work in preview.
- Tailwind v4 conventions: tokens in `@theme inline`, fonts loaded by `<link>`, no `tailwind.config.js`, no `@tailwind` directives, no remote `@import` in CSS.

## Out of scope (explicitly)

- Backend, Python AI, Express routes, Supabase schema, RLS — untouched.
- Lovable Cloud — not enabled; we use your existing Supabase project.
- No new persisted state; no new tables; no business-logic changes.

## Open question I'll need answered before/while building

After Supabase login, your `Login.jsx` redirects to `/dashboard`, but `App.jsx` has no `/dashboard` route — only `/`, `/login`, `/result`. I'll wire login → `/dashboard` (the new authed route) and treat that as the intended target. Tell me now if you'd rather it land on `/intake` instead.
