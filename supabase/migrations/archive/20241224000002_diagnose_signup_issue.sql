-- Diagnostic queries to find signup issues

-- 1. Check for orphaned accounts (auth users without profiles)
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  CASE WHEN p.id IS NULL THEN 'ORPHANED - No profile' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 20;

-- 2. Check if trigger exists and is enabled
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 3. Check user_profiles table structure for NOT NULL columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Test trigger function manually (use a test UUID)
-- Uncomment and run with a test UUID:
/*
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Simulate what happens when auth.users gets a new row
  PERFORM handle_new_user() FROM (
    SELECT 
      test_user_id as id,
      'test@example.com' as email,
      NULL as email_confirmed_at,
      '{"first_name": "Test", "last_name": "User"}'::jsonb as raw_user_meta_data
  ) AS test_auth_user;
  
  -- Check if profile was created
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = test_user_id) THEN
    RAISE NOTICE 'SUCCESS: Profile created for test user';
    -- Clean up
    DELETE FROM user_profiles WHERE id = test_user_id;
  ELSE
    RAISE NOTICE 'FAILED: Profile was NOT created';
  END IF;
END $$;
*/

-- 5. Check recent signup attempts
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.id as profile_id,
  p.user_type,
  p.status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
ORDER BY u.created_at DESC;

