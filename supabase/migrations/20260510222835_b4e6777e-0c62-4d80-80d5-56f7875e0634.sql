
-- set explicit search_path on set_updated_at
create or replace function public.set_updated_at() returns trigger
language plpgsql security definer set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

-- restrict EXECUTE on security-definer functions
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated, public;
