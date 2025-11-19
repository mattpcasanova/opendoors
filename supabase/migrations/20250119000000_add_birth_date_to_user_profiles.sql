-- Add birth_date column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add comment to document the column
COMMENT ON COLUMN public.user_profiles.birth_date IS 'User birth date for age verification (COPPA compliance) and birthday rewards';

-- Update the trigger function to include birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    birth_date,
    status,
    total_games,
    total_wins,
    daily_plays_remaining,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    CASE
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
      ELSE NULL
    END,
    CASE
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'
      ELSE 'pending_confirmation'
    END,
    0, -- total_games
    0, -- total_wins
    1, -- daily_plays_remaining
    'free', -- subscription_status
    NOW(), -- created_at
    NOW()  -- updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO anon;
