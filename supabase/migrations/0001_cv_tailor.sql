-- Oh My CV — AI tailoring backend (optional, "later" Supabase setup)
--
-- This schema backs the Supabase Edge Function proxy. The app works fully
-- without it (local-only / browser-direct mode); these tables are only used
-- once you switch the app to "Supabase proxy" mode in AI Settings.
--
-- There is no Supabase Auth in this app, so rows are namespaced by an
-- anonymous `owner_id` generated client-side. RLS is enabled with NO public
-- policies, which means the anon/publishable key cannot touch these tables
-- directly — only the Edge Function (which uses the service-role key) can.

create extension if not exists "pgcrypto";

-- The reference "full content" CV kept in memory, per anonymous owner.
create table if not exists public.cv_profiles (
  id          uuid primary key default gen_random_uuid(),
  owner_id    text not null,
  name        text not null default '',
  content     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists cv_profiles_owner_idx on public.cv_profiles (owner_id);

-- A saved analysis / tailoring run (score, gaps, tailored markdown).
create table if not exists public.tailor_sessions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     text not null,
  profile_id   uuid references public.cv_profiles (id) on delete set null,
  job_description text not null default '',
  analysis     jsonb,
  tailored_md  text,
  created_at   timestamptz not null default now()
);

create index if not exists tailor_sessions_owner_idx on public.tailor_sessions (owner_id);

-- Lock the tables down: enable RLS and add no policies, so only the
-- service-role (used by the Edge Function) can read/write.
alter table public.cv_profiles enable row level security;
alter table public.tailor_sessions enable row level security;

-- keep updated_at fresh on cv_profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cv_profiles_set_updated_at on public.cv_profiles;
create trigger cv_profiles_set_updated_at
  before update on public.cv_profiles
  for each row execute function public.set_updated_at();
