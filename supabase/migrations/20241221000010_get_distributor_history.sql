-- Secure RPC to fetch a distributor's sending history
-- Returns only rows where distributor_id matches the input
-- SECURITY DEFINER so client sessions don't get tripped up by RLS edge cases

create or replace function public.get_distributor_history(p_distributor_id uuid)
returns setof public.door_distributions
language sql
security definer
as $$
  select *
  from public.door_distributions
  where distributor_id = p_distributor_id
  order by created_at desc;
$$;

revoke all on function public.get_distributor_history(uuid) from public;
grant execute on function public.get_distributor_history(uuid) to authenticated;

comment on function public.get_distributor_history(uuid) is 'Return door_distributions for the given distributor_id (SECURITY DEFINER)';









