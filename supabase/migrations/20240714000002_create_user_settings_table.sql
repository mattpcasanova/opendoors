-- Create user_settings table for app-level preferences
CREATE TABLE public.user_settings (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  location_enabled boolean NOT NULL DEFAULT false,
  notifications_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
); 