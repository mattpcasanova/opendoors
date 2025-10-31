-- Add notification tracking columns to user_settings table
-- These track when we last sent automatic notifications to prevent spam

ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS last_daily_notification_date TEXT,
ADD COLUMN IF NOT EXISTS last_expiring_notification_date TEXT,
ADD COLUMN IF NOT EXISTS last_bonus_notification_date TEXT;

-- Add comments
COMMENT ON COLUMN public.user_settings.last_daily_notification_date IS 'Last date (YYYY-MM-DD EST) we sent daily reset notification to prevent duplicates';
COMMENT ON COLUMN public.user_settings.last_expiring_notification_date IS 'Last date (YYYY-MM-DD EST) we sent expiring rewards notification';
COMMENT ON COLUMN public.user_settings.last_bonus_notification_date IS 'Last date (YYYY-MM-DD EST) we sent bonus available notification';

