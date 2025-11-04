-- Delete accounts with specific emails (orphaned or problematic accounts)
-- This will cascade delete related records due to ON DELETE CASCADE constraints

-- Delete from auth.users (will cascade to user_profiles and other tables)
DELETE FROM auth.users 
WHERE email IN ('thejasper360@gmail.com', 'casahovaa@gmail.com');

-- Verify deletion
SELECT 
  email,
  created_at
FROM auth.users 
WHERE email IN ('thejasper360@gmail.com', 'casahovaa@gmail.com');
-- Should return 0 rows

