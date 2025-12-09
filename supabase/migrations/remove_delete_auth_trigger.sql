-- Remove the trigger and function that attempted to delete auth users
-- This approach doesn't work because database triggers cannot delete from auth.users
-- We're using an Edge Function with admin privileges instead

DROP TRIGGER IF EXISTS delete_auth_user_trigger ON public.user_profiles;
DROP FUNCTION IF EXISTS delete_auth_user_on_profile_delete();

COMMENT ON TABLE public.user_profiles IS 'Account deletion is handled by Edge Function delete-user which uses admin API';
