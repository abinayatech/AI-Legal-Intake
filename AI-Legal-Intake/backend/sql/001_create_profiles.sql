-- =====================================================================
-- Migration: 001_create_profiles.sql
-- Purpose:   Create the missing `profiles` table only.
--            Does NOT touch tickets, intake, analytics, reports,
--            notifications, or any other existing table.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------
-- One row per Supabase Auth user (auth.users.id is the FK + PK here).
-- "role" mirrors what backend/src/middleware/auth.js already expects
-- (req.user.role, default 'client') so the existing auth middleware
-- works against this table unmodified.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text,
  email         text,
  phone         text,
  role          text not null default 'client'
                check (role in ('client', 'attorney', 'admin')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is
  'User profile data linked 1:1 with auth.users. Created for AI-Legal-Intake profile feature.';

-- ---------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------
-- Primary key on id already gives us a unique index; these cover the
-- remaining lookup/filter patterns the profile + admin screens need.
create index if not exists idx_profiles_role  on public.profiles (role);
create index if not exists idx_profiles_email on public.profiles (email);

-- ---------------------------------------------------------------------
-- 3. updated_at auto-touch trigger
-- ---------------------------------------------------------------------
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------
-- 4. Auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------
-- This keeps Sign Up working end-to-end: the moment Supabase Auth
-- creates a row in auth.users, a matching profiles row appears so
-- middleware/auth.js's `.from('profiles').select('role, name')` never
-- comes back empty for a freshly-registered user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users may read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users may update their own profile (name, phone, avatar — not role).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users may insert their own profile row (covers any client-side
-- fallback path in case the handle_new_user trigger is ever skipped).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Admins/attorneys may read all profiles (e.g. ticket assignment UI).
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'attorney')
    )
  );

-- ---------------------------------------------------------------------
-- 6. Grants
-- ---------------------------------------------------------------------
-- RLS policies above are the real gate; these grants just allow the
-- authenticated/anon roles to reach the table at all (Supabase convention).
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;