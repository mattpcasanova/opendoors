-- Remove has_played_today column since we calculate it dynamically
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS has_played_today;

-- Update the index to remove has_played_today
DROP INDEX IF EXISTS idx_user_profiles_progress;
CREATE INDEX IF NOT EXISTS idx_user_profiles_progress ON user_profiles(id, last_daily_play_date); 