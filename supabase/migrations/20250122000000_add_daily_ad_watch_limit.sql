-- Add fields to track daily ad watch limit
ALTER TABLE user_profiles
ADD COLUMN ads_watched_today INTEGER DEFAULT 0,
ADD COLUMN last_ad_watch_date DATE;

-- Add comment explaining the fields
COMMENT ON COLUMN user_profiles.ads_watched_today IS 'Number of ads watched today (max 3 per day)';
COMMENT ON COLUMN user_profiles.last_ad_watch_date IS 'Last date user watched an ad (used for daily reset)';
