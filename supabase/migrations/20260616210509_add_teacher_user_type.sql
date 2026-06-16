-- Allow 'teacher' as a user_profiles.user_type (the School system depends on it).
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_type_check
  CHECK (user_type IN ('user', 'distributor', 'admin', 'teacher'));
