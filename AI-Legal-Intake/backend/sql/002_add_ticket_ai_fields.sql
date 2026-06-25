-- =====================================================================
-- Migration: 002_add_ticket_ai_fields.sql
-- Purpose:   Add the AI-result columns the frontend (result.tsx,
--            tickets.$id.tsx) and intakeCtrl.js already read/write,
--            in case they don't exist on `tickets` yet.
--            Uses IF NOT EXISTS everywhere — safe to run even if some
--            or all of these columns are already present. Does NOT
--            touch any other table or any existing ticket data.
-- =====================================================================

alter table public.tickets
  add column if not exists confidence              numeric,
  add column if not exists suggested_documents      jsonb not null default '[]'::jsonb,
  add column if not exists recommended_department   text,
  add column if not exists next_actions             jsonb not null default '[]'::jsonb;

comment on column public.tickets.confidence is
  'AI triage confidence score, 0–1. Null when the AI service did not return one.';
comment on column public.tickets.suggested_documents is
  'AI-suggested document list for this matter, as a JSON array of strings.';
comment on column public.tickets.recommended_department is
  'AI-recommended routing department for this matter. Null when not provided.';
comment on column public.tickets.next_actions is
  'AI-suggested next actions for this matter, as a JSON array of strings.';

-- Backfill any existing rows where these landed as SQL NULL for the
-- array columns (e.g. inserted before this migration) so the frontend's
-- Array.isArray(...) checks behave consistently as [] rather than null.
update public.tickets
set suggested_documents = '[]'::jsonb
where suggested_documents is null;

update public.tickets
set next_actions = '[]'::jsonb
where next_actions is null;
