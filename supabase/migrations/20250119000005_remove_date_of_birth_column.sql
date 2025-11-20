-- Remove duplicate date_of_birth column from user_profiles
-- We use birth_date instead (added in migration 20250119000000)

-- Drop the old column
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS date_of_birth;

COMMENT ON COLUMN public.user_profiles.birth_date IS 'User birth date for age verification (COPPA compliance) and birthday rewards. This is the only birth date column - date_of_birth was removed as duplicate.';
