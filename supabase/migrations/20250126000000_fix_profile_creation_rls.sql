-- Fix RLS policies to allow trigger-based profile creation
-- The trigger runs with SECURITY DEFINER but still needs proper RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "System can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

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

CREATE POLICY "Users can insert their own events"
  ON public.analytics_events FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    CASE
      WHEN current_setting('role') = 'service_role' THEN true
      ELSE auth.uid() = user_id
    END
  );

GRANT INSERT ON public.analytics_events TO service_role;

COMMENT ON POLICY "Service role can insert profiles" ON public.user_profiles IS
  'Allows triggers (running as service_role) to create user profiles during signup';

COMMENT ON POLICY "Users can insert their own profile" ON public.user_profiles IS
  'Allows users to create their own profile as a fallback if trigger fails';
