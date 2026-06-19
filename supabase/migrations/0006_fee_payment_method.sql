-- Admin-set preferred payment method (and instructions) for the claim charges.
alter table public.accounts add column if not exists fee_payment_method       text not null default 'card';
alter table public.accounts add column if not exists fee_payment_instructions text;
