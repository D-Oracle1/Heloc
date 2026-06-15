-- US Bank HELOC — per-user auth, deposit transactions, and signup seeding.

-- 1. Per-user ownership ----------------------------------------------------
alter table public.accounts add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.claims   add column if not exists user_id uuid references auth.users (id) on delete cascade;

create unique index if not exists accounts_user_id_key on public.accounts (user_id);
create index if not exists claims_user_id_idx on public.claims (user_id);

-- 2. Transaction direction + source (deposits vs claims) -------------------
alter table public.claims add column if not exists direction text not null default 'out'
  check (direction in ('in','out'));
alter table public.claims add column if not exists source text;

-- 3. Drop singleton demo rows now that data is per-user --------------------
delete from public.claims   where user_id is null;
delete from public.accounts where user_id is null;

-- 4. Per-user RLS policies -------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['accounts','claims'] loop
    execute format('drop policy if exists %I on public.%I;', t || '_anon_all', t);
    execute format('drop policy if exists %I on public.%I;', t || '_owner', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t || '_owner', t
    );
  end loop;
end $$;

-- payout_destinations stays globally readable (generic options).
drop policy if exists payout_destinations_anon_all on public.payout_destinations;
drop policy if exists payout_destinations_read on public.payout_destinations;
create policy payout_destinations_read on public.payout_destinations
  for select to anon, authenticated using (true);

-- 5. Seed every new user: $650,000 balance + one US Bank deposit ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1));
  initials  text;
  parts     text[] := regexp_split_to_array(full_name, '\s+');
begin
  if array_length(parts, 1) >= 2 then
    initials := upper(left(parts[1], 1) || left(parts[array_length(parts,1)], 1));
  else
    initials := upper(left(full_name, 2));
  end if;

  insert into public.accounts
    (user_id, name, email, avatar_initials, member_since, credit_limit,
     available_balance, outstanding_balance, apr, property)
  values
    (new.id, initcap(full_name), new.email, initials, current_date, 650000,
     650000, 0, 7.85, 'Linked property on file')
  on conflict (user_id) do nothing;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
