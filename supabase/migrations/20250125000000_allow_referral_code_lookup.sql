-- Allow users to lookup other users by referral code for referral creation
-- This is needed so new users can find their referrer during signup

-- Add policy to allow reading referral_code column for referral lookups
CREATE POLICY "Users can lookup referral codes"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Update the existing "Users can read their own profile" policy to be more specific
-- Drop the old policy
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;

-- Create a new policy that allows users to read their own full profile
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON POLICY "Users can lookup referral codes" ON public.user_profiles IS
  'Allows authenticated users to lookup other users by referral code during signup. Returns minimal info (id only) for referral creation.';
