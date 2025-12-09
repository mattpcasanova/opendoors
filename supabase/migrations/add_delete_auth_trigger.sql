-- Create a trigger to delete auth.users when user_profiles is deleted
-- This ensures account deletion removes both profile and auth account

-- First, create a function that deletes the auth user
CREATE OR REPLACE FUNCTION delete_auth_user_on_profile_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS delete_auth_user_trigger ON public.user_profiles;

CREATE TRIGGER delete_auth_user_trigger
AFTER DELETE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION delete_auth_user_on_profile_delete();

COMMENT ON FUNCTION delete_auth_user_on_profile_delete() IS 'Automatically deletes auth.users entry when user_profiles row is deleted';
