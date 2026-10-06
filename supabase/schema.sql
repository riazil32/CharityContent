-- CharityContent database schema for Supabase.
-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organisations: one per signed-up account for the MVP.
-- ---------------------------------------------------------------------------
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null,
  org_type text default '',
  description text default '',
  audience text default '',
  website text default '',
  platforms text[] not null default '{}',
  tone text not null default 'friendly',
  tone_notes text default '',
  causes text[] not null default '{}',
  campaigns jsonb not null default '[]',
  key_dates jsonb not null default '[]',
  ai_preferences jsonb not null default '{}',
  -- Billing and usage. Only changed by trusted server code (see grants below).
  plan text not null default 'free' check (plan in ('free', 'starter', 'growth')),
  stripe_customer_id text,
  stripe_subscription_id text,
  generations_period text not null default to_char(now(), 'YYYY-MM'),
  generations_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Generated content (library + calendar).
-- ---------------------------------------------------------------------------
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  campaign_id text,
  platform text not null check (platform in ('instagram', 'facebook', 'linkedin', 'x')),
  content_type text not null,
  tone text not null,
  headline text not null default '',
  caption text not null default '',
  cta text not null default '',
  hashtags text[] not null default '{}',
  image_idea text not null default '',
  scheduled_for date,
  favourite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_org_date on public.content_items (org_id, scheduled_for);

-- ---------------------------------------------------------------------------
-- Row-level security: users can only see and change their own organisation.
-- ---------------------------------------------------------------------------
alter table public.organisations enable row level security;
alter table public.content_items enable row level security;

drop policy if exists "own organisation" on public.organisations;
create policy "own organisation" on public.organisations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "own content" on public.content_items;
create policy "own content" on public.content_items
  for all using (
    org_id in (select id from public.organisations where owner_id = auth.uid())
  ) with check (
    org_id in (select id from public.organisations where owner_id = auth.uid())
  );

-- Signed-in users may edit their profile but not their plan or usage counters.
revoke update on public.organisations from authenticated;
grant update (
  name, org_type, description, audience, website, platforms, tone, tone_notes,
  causes, campaigns, key_dates, ai_preferences, updated_at
) on public.organisations to authenticated;
revoke insert on public.organisations from authenticated;
grant insert (
  id, owner_id, name, org_type, description, audience, website, platforms, tone,
  tone_notes, causes, campaigns, key_dates, ai_preferences
) on public.organisations to authenticated;

-- ---------------------------------------------------------------------------
-- consume_generation(): checks the plan limit and uses one AI generation.
-- Called by /api/generate. Raises 'limit_reached' when the allowance is spent.
-- ---------------------------------------------------------------------------
create or replace function public.consume_generation()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  org public.organisations;
  period text := to_char(now(), 'YYYY-MM');
  monthly_limit integer;
begin
  select * into org from public.organisations where owner_id = auth.uid() for update;
  if not found then
    raise exception 'no_organisation';
  end if;

  if org.generations_period <> period then
    org.generations_used := 0;
  end if;

  monthly_limit := case org.plan when 'free' then 5 when 'starter' then 50 else null end;
  if monthly_limit is not null and org.generations_used >= monthly_limit then
    raise exception 'limit_reached';
  end if;

  update public.organisations
     set generations_used = org.generations_used + 1,
         generations_period = period,
         updated_at = now()
   where id = org.id;

  return coalesce(monthly_limit - org.generations_used - 1, -1);
end;
$$;

revoke all on function public.consume_generation() from public;
grant execute on function public.consume_generation() to authenticated;
