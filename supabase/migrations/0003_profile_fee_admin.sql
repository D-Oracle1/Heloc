-- US Bank HELOC — richer profiles, processing fee, per-user linked accounts, admin.

-- 1. Account profile fields + processing fee --------------------------------
alter table public.accounts add column if not exists phone          text;
alter table public.accounts add column if not exists dob            date;
alter table public.accounts add column if not exists address_street text;
alter table public.accounts add column if not exists address_city   text;
alter table public.accounts add column if not exists address_state  text;
alter table public.accounts add column if not exists address_zip    text;
alter table public.accounts add column if not exists ssn_last4      text;
alter table public.accounts add column if not exists employer       text;
alter table public.accounts add column if not exists annual_income  numeric(14,2);
alter table public.accounts add column if not exists processing_fee numeric(14,2) not null default 500;
alter table public.accounts add column if not exists fee_paid       boolean       not null default false;

-- property is no longer required (replaced by structured address).
alter table public.accounts alter column property drop not null;

-- 2. Per-user linked accounts (payout destinations) -------------------------
alter table public.payout_destinations add column if not exists user_id uuid references auth.users (id) on delete cascade;
-- Remove the old shared/global demo destinations.
delete from public.payout_destinations where user_id is null;
create index if not exists payout_destinations_user_id_idx on public.payout_destinations (user_id);

-- 3. Admins ----------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- admins can see the admin list; nobody else.
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins
  for select to authenticated using (public.is_admin());

-- 4. RLS: owners OR admins --------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['accounts','claims','payout_destinations'] loop
    execute format('drop policy if exists %I on public.%I;', t || '_owner', t);
    execute format('drop policy if exists %I on public.%I;', t || '_anon_all', t);
    execute format('drop policy if exists %I on public.%I;', t || '_read', t);
    execute format('drop policy if exists %I on public.%I;', t || '_owner_admin', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());',
      t || '_owner_admin', t
    );
  end loop;
end $$;

-- 5. Signup seeding: full profile + linked accounts -------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  md        jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := coalesce(nullif(trim(md->>'full_name'), ''), split_part(new.email, '@', 1));
  initials  text;
  parts     text[] := regexp_split_to_array(full_name, '\s+');
  la        jsonb;
begin
  if array_length(parts, 1) >= 2 then
    initials := upper(left(parts[1], 1) || left(parts[array_length(parts,1)], 1));
  else
    initials := upper(left(full_name, 2));
  end if;

  insert into public.accounts
    (user_id, name, email, avatar_initials, member_since, credit_limit,
     available_balance, outstanding_balance, apr, processing_fee, fee_paid,
     phone, dob, address_street, address_city, address_state, address_zip,
     ssn_last4, employer, annual_income)
  values
    (new.id, initcap(full_name), new.email, initials, current_date, 650000,
     650000, 0, 7.85, 500, false,
     nullif(md->>'phone',''),
     (nullif(md->>'dob',''))::date,
     nullif(md->>'address_street',''),
     nullif(md->>'address_city',''),
     nullif(md->>'address_state',''),
     nullif(md->>'address_zip',''),
     nullif(md->>'ssn_last4',''),
     nullif(md->>'employer',''),
     (nullif(md->>'annual_income',''))::numeric)
  on conflict (user_id) do nothing;

  -- Linked bank accounts captured at signup -> payout destinations.
  for la in select * from jsonb_array_elements(coalesce(md->'linked_accounts', '[]'::jsonb))
  loop
    insert into public.payout_destinations (id, user_id, label, method, detail, sort_order)
    values (
      'la-' || replace(gen_random_uuid()::text, '-', ''),
      new.id,
      coalesce(nullif(la->>'label',''), 'Linked account'),
      coalesce(nullif(la->>'method',''), 'bank'),
      coalesce(nullif(la->>'detail',''), ''),
      0
    );
  end loop;

  -- The $650,000 US Bank deposit.
  insert into public.claims
    (user_id, id, reference, amount, method, status, created_at, note, destination, direction, source)
  values
    (new.id,
     'dep-' || replace(new.id::text, '-', ''),
     'DEP-' || to_char(now(), 'YYYY') || '-' || upper(left(replace(new.id::text, '-', ''), 6)),
     650000, 'bank', 'completed', now(),
     'Refund for Gerrald Butler''s HELOC', 'US Bank', 'in', 'US Bank')
  on conflict (id) do nothing;

  return new;
end;
$$;
