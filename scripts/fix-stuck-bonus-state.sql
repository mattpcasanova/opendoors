-- Fix users stuck in invalid state: games_until_bonus = 0 but no bonus door granted
-- Run this in Supabase SQL Editor to fix your current account

UPDATE user_profiles
SET
  bonus_plays_available = 1,
  games_until_bonus = 5,
  updated_at = NOW()
WHERE
  games_until_bonus = 0
  AND bonus_plays_available = 0;

-- Check the results
SELECT
  id,
  email,
  games_until_bonus,
  bonus_plays_available,
  updated_at
FROM user_profiles
WHERE email LIKE '%mattcasanova%' OR bonus_plays_available > 0
ORDER BY updated_at DESC;
