-- Create Apple Reviewer Test Account
-- Run this in Supabase SQL Editor to create a test account for App Store reviewers
--
-- IMPORTANT: After running this script, you need to set the password using Supabase Auth
-- Go to: Authentication > Users > Find the user > Reset Password
-- Or create the account through the app's signup flow with these credentials:
-- Email: applereview@opendoorsgame.com
-- Password: OpenDoors2025!

-- Note: This script creates the user profile and preferences
-- You still need to create the auth user in Supabase Auth dashboard or through signup

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Auth user ID for applereview@opendoorsgame.com
  v_user_id := 'b7e5b331-27a9-44d3-8d23-84857050b4f7'::UUID;

  -- Create user profile - reviewers will complete survey and tutorial themselves
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    has_completed_survey,
    tutorial_completed,
    games_until_bonus,
    bonus_plays_available,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'applereview@opendoorsgame.com',
    'Apple',
    'Reviewer',
    false,  -- Let reviewers complete the survey
    false,  -- Let reviewers complete the tutorial
    5,      -- Default starting value
    0,      -- No bonus plays yet
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    status = EXCLUDED.status,
    updated_at = NOW();

  RAISE NOTICE 'Test account profile created with ID: %', v_user_id;
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create auth user in Supabase Auth dashboard or through app signup';
  RAISE NOTICE '2. Copy the user ID from the auth user';
  RAISE NOTICE '3. Update v_user_id in this script and re-run, OR';
  RAISE NOTICE '4. Just sign up normally with applereview@opendoorsgame.com in the app';
END $$;

-- Verify the account was created
SELECT
  id,
  email,
  first_name,
  last_name,
  has_completed_survey,
  tutorial_completed,
  games_until_bonus,
  bonus_plays_available,
  last_daily_play_date,
  status
FROM user_profiles
WHERE email = 'applereview@opendoorsgame.com';
