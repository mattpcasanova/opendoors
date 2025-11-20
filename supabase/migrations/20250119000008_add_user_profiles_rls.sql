-- Add RLS policies to user_profiles table
-- This table was missing policies and is currently unrestricted

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- System can insert profiles (via trigger)
CREATE POLICY "System can insert profiles"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;

COMMENT ON TABLE public.user_profiles IS 'User profiles with RLS enabled - users can only see/update their own profile';
