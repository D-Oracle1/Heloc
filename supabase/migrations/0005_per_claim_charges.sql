-- Per-claim charges (network + VAT) and removal of linked accounts.

-- Charge config on the account (processing_fee already exists).
alter table public.accounts add column if not exists network_charge numeric(14,2) not null default 150;
alter table public.accounts add column if not exists vat_rate       numeric(6,2)  not null default 7.5;

-- Signup seeding: full profile + $650k US Bank deposit. No linked accounts.
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
begin
  if array_length(parts, 1) >= 2 then
    initials := upper(left(parts[1], 1) || left(parts[array_length(parts,1)], 1));
  else
    initials := upper(left(full_name, 2));
  end if;

  insert into public.accounts
    (user_id, name, email, avatar_initials, member_since, credit_limit,
     available_balance, outstanding_balance, apr, processing_fee, network_charge, vat_rate, fee_paid,
     phone, dob, address_street, address_city, address_state, address_zip,
     ssn_last4, employer, annual_income)
  values
    (new.id, initcap(full_name), new.email, initials, current_date, 650000,
     650000, 0, 7.85, 500, 150, 7.5, false,
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
