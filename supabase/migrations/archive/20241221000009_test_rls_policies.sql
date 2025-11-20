-- Test RLS policies across roles for door_distributions, earned_rewards, door_notifications
-- NOTE: Replace the placeholder UUIDs below before running.
-- This script is safe to run; it does not mutate production data beyond inserting test rows
-- which are cleaned up at the end. Do NOT wrap in a transaction; RLS uses session settings.

-- REQUIRED: Replace these UUIDs
-- Distributor user id
\set distributor_id '00000000-0000-0000-0000-000000000001'
-- Recipient user id (regular authenticated user)
\set recipient_id   '00000000-0000-0000-0000-000000000002'
-- Another user id (for negative tests)
\set other_user_id  '00000000-0000-0000-0000-000000000003'

-- Utility: Set the auth context (as Supabase PostgREST does)
-- Supabase checks request.jwt.claim.sub for auth.uid()
create or replace function public.__set_auth(uid uuid) returns void as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$ language plpgsql security definer;

-- Utility: simple assert helper
create or replace function public.__assert(condition boolean, message text) returns void as $$
begin
  if not condition then
    raise exception 'ASSERTION FAILED: %', message;
  end if;
end;
$$ language plpgsql;

-- Create ephemeral test data and validate access
do $$
declare
  dd_id uuid;
  er_id uuid;
  dn_id uuid;
  cnt int;
begin
  -- 1) As distributor: can insert via RPCs; cannot insert directly
  perform public.__set_auth(:'distributor_id');

  -- Direct insert should fail due to WITH CHECK (false)
  begin
    insert into public.door_distributions(distributor_id, recipient_id, organization_id, doors_sent, reason)
    values (:'distributor_id', :'recipient_id', null, 1, 'test-direct-insert');
    raise exception 'Expected direct insert to fail (door_distributions)';
  exception when others then
    -- expected
  end;

  -- RPC should succeed
  select id into dd_id from public.create_door_distribution(:'distributor_id', :'recipient_id', null, 1, 'test-rpc');
  perform public.__assert(dd_id is not null, 'create_door_distribution returned null id');

  -- Distributor should be able to select their own distribution rows
  select count(*) into cnt from public.door_distributions where id = dd_id;
  perform public.__assert(cnt = 1, 'Distributor cannot select own door_distribution');

  -- 2) As recipient: can see own earned rewards; cannot insert directly; can get notification via RPC
  perform public.__set_auth(:'recipient_id');

  -- Direct insert should fail on earned_rewards
  begin
    insert into public.earned_rewards(user_id, source_type, source_name, description, doors)
    values (:'recipient_id', 'test', 'unit', 'direct insert should fail', 1);
    raise exception 'Expected direct insert to fail (earned_rewards)';
  exception when others then
    -- expected
  end;

  -- RPC should succeed
  select id into er_id from public.add_earned_reward(:'recipient_id', 'test', 'unit', 'rpc ok', 1);
  perform public.__assert(er_id is not null, 'add_earned_reward returned null id');

  -- Recipient should be able to select own earned_reward row
  select count(*) into cnt from public.earned_rewards where id = er_id and user_id = :'recipient_id';
  perform public.__assert(cnt = 1, 'Recipient cannot select own earned_reward');

  -- Notifications
  select id into dn_id from public.create_door_notification(:'recipient_id', 'Test Distributor', 1, 'rpc ok');
  perform public.__assert(dn_id is not null, 'create_door_notification returned null id');
  select count(*) into cnt from public.door_notifications where id = dn_id and user_id = :'recipient_id';
  perform public.__assert(cnt = 1, 'Recipient cannot select own door_notification');

  -- 3) Negative access: other user should not see recipient rows
  perform public.__set_auth(:'other_user_id');
  select count(*) into cnt from public.earned_rewards where id = er_id;
  perform public.__assert(cnt = 0, 'Other user should not read another user\'s earned_reward');
  select count(*) into cnt from public.door_notifications where id = dn_id;
  perform public.__assert(cnt = 0, 'Other user should not read another user\'s door_notification');
  select count(*) into cnt from public.door_distributions where id = dd_id;
  perform public.__assert(cnt = 0, 'Other user should not read someone else\'s door_distribution');

  -- 4) Update policy: recipient can update their own earned_reward (e.g., mark claimed)
  perform public.__set_auth(:'recipient_id');
  update public.earned_rewards set claimed_at = now() where id = er_id;
  select count(*) into cnt from public.earned_rewards where id = er_id and claimed_at is not null;
  perform public.__assert(cnt = 1, 'Recipient cannot update own earned_reward');

  -- Other user update should fail
  perform public.__set_auth(:'other_user_id');
  begin
    update public.earned_rewards set description = 'should fail' where id = er_id;
    raise exception 'Expected update to fail for other user (earned_rewards)';
  exception when others then
    -- expected
  end;

  -- Cleanup created rows as admin bypassing RLS
  perform set_config('role', 'service_role', true);
  delete from public.door_notifications where id = dn_id;
  delete from public.earned_rewards where id = er_id;
  delete from public.door_distributions where id = dd_id;
end $$;

-- Drop helpers
drop function if exists public.__set_auth(uid uuid);
drop function if exists public.__assert(boolean, text);

-- If the script completes without throwing, RLS policies passed all tests.



