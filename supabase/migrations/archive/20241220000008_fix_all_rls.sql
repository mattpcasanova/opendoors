-- Fix RLS for all tables involved in door distribution
-- This will disable RLS on the problematic tables

-- Fix door_notifications table
ALTER TABLE public.door_notifications DISABLE ROW LEVEL SECURITY;

-- Drop all policies on door_notifications
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'door_notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.door_notifications';
    END LOOP;
END $$;

-- Grant full access to door_notifications
GRANT ALL ON public.door_notifications TO authenticated;

-- Fix earned_rewards table
ALTER TABLE public.earned_rewards DISABLE ROW LEVEL SECURITY;

-- Drop all policies on earned_rewards
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'earned_rewards') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.earned_rewards';
    END LOOP;
END $$;

-- Grant full access to earned_rewards
GRANT ALL ON public.earned_rewards TO authenticated;

-- Add comments
COMMENT ON TABLE public.door_notifications IS 'Door notifications - RLS disabled for MVP';
COMMENT ON TABLE public.earned_rewards IS 'Earned rewards - RLS disabled for MVP';
