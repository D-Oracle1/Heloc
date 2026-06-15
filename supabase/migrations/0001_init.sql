-- US Bank HELOC — initial schema
-- Tables mirror the app data model in src/types.ts.
-- NOTE: this is a demo app with no auth; RLS is enabled with permissive
-- anon policies so the public anon key can read/write. Tighten these
-- (e.g. tie rows to auth.uid()) once real authentication is added.

create extension if not exists "pgcrypto";

-- Account (singleton for the demo) -----------------------------------------
create table if not exists public.accounts (
  id                  uuid primary key default gen_random_uuid(),
  name                text        not null,
  email               text        not null,
  avatar_initials     text        not null,
  member_since        date        not null,
  credit_limit        numeric(14,2) not null,
  available_balance   numeric(14,2) not null,
  outstanding_balance numeric(14,2) not null,
  apr                 numeric(6,2)  not null,
  property            text        not null,
  created_at          timestamptz not null default now()
);

-- Payout destinations -------------------------------------------------------
create table if not exists public.payout_destinations (
  id          text primary key,
  label       text not null,
  method      text not null check (method in ('bank','wire','card')),
  detail      text not null,
  sort_order  int  not null default 0
);

-- Claims --------------------------------------------------------------------
create table if not exists public.claims (
  id          text primary key,
  reference   text not null,
  amount      numeric(14,2) not null,
  method      text not null check (method in ('bank','wire','card')),
  status      text not null check (status in ('pending','approved','processing','completed','rejected')),
  created_at  timestamptz not null default now(),
  note        text,
  destination text not null
);

create index if not exists claims_created_at_idx on public.claims (created_at desc);

-- Row Level Security --------------------------------------------------------
alter table public.accounts            enable row level security;
alter table public.payout_destinations enable row level security;
alter table public.claims              enable row level security;

-- Permissive demo policies (anon full access). Replace for production.
do $$
declare t text;
begin
  foreach t in array array['accounts','payout_destinations','claims'] loop
    execute format('drop policy if exists %I on public.%I;', t || '_anon_all', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated using (true) with check (true);',
      t || '_anon_all', t
    );
  end loop;
end $$;
