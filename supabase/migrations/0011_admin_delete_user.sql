-- Admin: delete a user entirely (auth row + all owned data via cascade).
--
-- The anon client can already delete public.accounts/claims/payout_destinations
-- rows as an admin (RLS `for all` + is_admin()), but it cannot remove the
-- auth.users row — that requires elevated rights. This security-definer RPC
-- checks admin, then deletes the auth user; the existing `on delete cascade`
-- foreign keys clean up accounts, claims, and payout_destinations.

create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if target = auth.uid() then
    raise exception 'cannot delete your own account';
  end if;
  delete from auth.users where id = target;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
