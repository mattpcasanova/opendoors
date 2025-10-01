-- =====================================================
-- SET ALL EXISTING USERS TO 'user' TYPE
-- Run this AFTER running create_organizations_system.sql
-- This ensures all existing accounts are set to regular users
-- =====================================================

-- Set all existing user_profiles to 'user' type with default values
UPDATE public.user_profiles 
SET 
  user_type = 'user',
  doors_available = 0,
  doors_distributed = 0,
  organization_id = NULL
WHERE user_type IS NULL OR user_type = '';

-- Verify the update
SELECT 
  id,
  email,
  user_type,
  organization_id,
  doors_available,
  doors_distributed
FROM public.user_profiles
ORDER BY created_at DESC;

