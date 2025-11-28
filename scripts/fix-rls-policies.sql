-- Fix RLS policies to allow trigger-based profile creation
-- Safe version that won't error if policies already exist

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;

-- Allow service role (used by triggers) to insert profiles
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile (for manual fallback)
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Grant INSERT permission to service_role
GRANT INSERT ON public.user_profiles TO service_role;

-- Also fix analytics_events RLS to allow service role
DROP POLICY IF EXISTS "Users can insert their own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Service role can insert analytics events" ON public.analytics_events;

-- Create combined policy for both roles
CREATE POLICY "Users and service role can insert events"
  ON public.analytics_events FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    -- Service role can insert any event
    current_setting('role') = 'service_role'
    OR
    -- Authenticated users can only insert their own events
    auth.uid() = user_id
  );

GRANT INSERT ON public.analytics_events TO service_role;

-- Verify policies were created
SELECT 'RLS policies updated successfully' as message;
