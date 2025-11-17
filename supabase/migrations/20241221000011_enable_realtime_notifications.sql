-- Ensure realtime is enabled for door_notifications so clients receive INSERT events

-- Add table to the supabase_realtime publication (idempotent guards)
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    -- Add if not already present
    begin
      execute 'alter publication supabase_realtime add table public.door_notifications';
    exception when duplicate_object then
      -- already added
      null;
    end;
  end if;
end $$;

-- Optional but recommended: include full row image for robust updates
alter table public.door_notifications replica identity full;

comment on table public.door_notifications is 'Realtime-enabled: publishes INSERT events to supabase_realtime';









