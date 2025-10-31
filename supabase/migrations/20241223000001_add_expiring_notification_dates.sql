-- Add separate tracking columns for expiring rewards notifications
-- One for "expiring soon" (2 days) and one for "expiring tomorrow" (1 day)

ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS last_expiring_soon_date TEXT,
ADD COLUMN IF NOT EXISTS last_expiring_tomorrow_date TEXT;

-- Add comments
COMMENT ON COLUMN public.user_settings.last_expiring_soon_date IS 'Last date (YYYY-MM-DD EST) we sent "expiring soon" notification for rewards expiring in 2 days';
COMMENT ON COLUMN public.user_settings.last_expiring_tomorrow_date IS 'Last date (YYYY-MM-DD EST) we sent "expiring tomorrow" notification for rewards expiring tomorrow';

