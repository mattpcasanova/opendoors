-- Add progress tracking fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS games_until_bonus integer NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS bonus_plays_available integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_daily_play_date date,
ADD COLUMN IF NOT EXISTS has_played_today boolean NOT NULL DEFAULT false;

-- Add comments to the new columns
COMMENT ON COLUMN public.user_profiles.games_until_bonus IS 'Number of games remaining until bonus play is earned (0-5)';
COMMENT ON COLUMN public.user_profiles.bonus_plays_available IS 'Number of bonus plays available to the user';
COMMENT ON COLUMN public.user_profiles.last_daily_play_date IS 'Date of the last daily play (in EST timezone)';
COMMENT ON COLUMN public.user_profiles.has_played_today IS 'Whether the user has played their daily game today';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_progress ON user_profiles(id, last_daily_play_date, has_played_today); 