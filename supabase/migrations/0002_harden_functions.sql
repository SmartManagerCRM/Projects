-- Pin a stable search_path on the RLS helper functions (defense in depth for
-- SECURITY DEFINER functions), while keeping them callable by `authenticated`
-- since RLS policies invoke them as the querying role.
alter function public.is_company_member(uuid) set search_path = public, pg_temp;
alter function public.project_company_id(uuid) set search_path = public, pg_temp;
alter function public.development_company_id(uuid) set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;

revoke execute on function public.is_company_member(uuid) from anon, authenticated;
revoke execute on function public.project_company_id(uuid) from anon, authenticated;
revoke execute on function public.development_company_id(uuid) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;

-- RLS policies run as the querying (authenticated) role and must retain
-- EXECUTE on these SECURITY DEFINER helper functions, or every policy check
-- fails closed.
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.project_company_id(uuid) to authenticated;
grant execute on function public.development_company_id(uuid) to authenticated;
