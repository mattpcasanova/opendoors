-- 'lost' = a play-to-win reward the student played and did not win.
-- Must be its own migration: Postgres cannot use a newly added enum value
-- in the same transaction that adds it.
ALTER TYPE public.granted_reward_status ADD VALUE IF NOT EXISTS 'lost';
