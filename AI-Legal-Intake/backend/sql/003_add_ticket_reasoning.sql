-- =====================================================================
-- Migration: 003_add_ticket_reasoning.sql
-- Purpose:   Add the `reasoning` column that intakeCtrl.js now writes
--            and tickets.$id.tsx / result.tsx already read.
--            Safe to run multiple times — uses IF NOT EXISTS.
-- =====================================================================

alter table public.tickets
  add column if not exists reasoning text;

comment on column public.tickets.reasoning is
  'AI chain-of-thought reasoning for this triage, if returned by the AI service.';
