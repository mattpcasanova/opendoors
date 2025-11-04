-- Fix user profile trigger to include all required columns
-- The trigger was missing user_type, doors_available, and doors_distributed
-- which are NOT NULL columns, causing trigger to fail on signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert user profile with all required columns
  BEGIN
    INSERT INTO public.user_profiles (
      id,
      email,
      first_name,
      last_name,
      phone,
      status,
      total_games,
      total_wins,
      daily_plays_remaining,
      subscription_status,
      user_type,
      doors_available,
      doors_distributed,
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
        WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'
        ELSE 'pending_confirmation'
      END,
      0, -- total_games
      0, -- total_wins
      1, -- daily_plays_remaining
      'free', -- subscription_status
      'user', -- user_type (required, NOT NULL)
      0, -- doors_available (required, NOT NULL)
      0, -- doors_distributed (required, NOT NULL)
      NOW(), -- created_at
      NOW()  -- updated_at
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user_profile for user %: %', NEW.id, SQLERRM;
    -- Re-raise the error so we can see what's wrong
    RAISE;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger should already exist, but ensure it's set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO anon;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user_profile when a new auth user is created. Includes all required columns.';

