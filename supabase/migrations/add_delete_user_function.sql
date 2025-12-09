-- Function to allow users to delete their own account
-- This is required for App Store compliance

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the authenticated user's auth account
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account for App Store compliance';
