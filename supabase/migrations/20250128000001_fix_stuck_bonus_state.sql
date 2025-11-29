-- Fix users stuck in invalid state: games_until_bonus = 0 but no bonus door granted
-- This can happen if the user reached 0/5 before the reset logic was added

UPDATE user_profiles
SET
  bonus_plays_available = 1,
  games_until_bonus = 5
WHERE
  games_until_bonus = 0
  AND bonus_plays_available = 0;
