-- Fix orphaned accounts (auth users without profiles)
-- This creates profiles for any auth users that don't have corresponding user_profiles

INSERT INTO public.user_profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  status,
  total_games,
  total_wins,
  daily_plays_remaining,
  subscription_status,
  user_type,
  doors_available,
  doors_distributed,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.raw_user_meta_data->>'phone', NULL),
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'active'
    ELSE 'pending_confirmation'
  END,
  0, -- total_games
  0, -- total_wins
  1, -- daily_plays_remaining
  'free', -- subscription_status
  'user', -- user_type
  0, -- doors_available
  0, -- doors_distributed
  u.created_at,
  NOW() -- updated_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the fix
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'STILL ORPHANED' ELSE 'FIXED ✓' END as status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Should return 0 rows if all fixed

