-- Assigned account officer / manager (admin-set, defaults to Michael Brown).
alter table public.accounts add column if not exists officer_name  text not null default 'Michael Brown';
alter table public.accounts add column if not exists officer_email text not null default 'michael.brown@pridebankheloc.com';
