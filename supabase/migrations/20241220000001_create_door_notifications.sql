-- Create door_notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.door_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  distributor_name TEXT NOT NULL,
  doors_sent INTEGER NOT NULL,
  reason TEXT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT door_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT door_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT door_notifications_doors_sent_positive CHECK (doors_sent > 0)
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_door_notifications_user_id ON public.door_notifications USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_door_notifications_read ON public.door_notifications USING btree (read) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_door_notifications_created_at ON public.door_notifications USING btree (created_at DESC) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.door_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" ON public.door_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.door_notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add comments
COMMENT ON TABLE public.door_notifications IS 'Notifications for users when they receive doors from distributors';
COMMENT ON COLUMN public.door_notifications.distributor_name IS 'Name of the distributor who sent the doors';
COMMENT ON COLUMN public.door_notifications.doors_sent IS 'Number of doors sent';
COMMENT ON COLUMN public.door_notifications.reason IS 'Reason provided by distributor for sending doors';
COMMENT ON COLUMN public.door_notifications.read IS 'Whether the user has seen this notification';
