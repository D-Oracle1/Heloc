-- Drop the "(demo)" wording from the seeded deposit note (keep the credit).
update public.claims set note = 'Opening HELOC credit' where note = 'Opening HELOC credit (demo)';

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
     'Opening HELOC credit', 'American Pride Bank', 'in', 'American Pride Bank')
  on conflict (id) do nothing;

  return new;
end;
$$;
