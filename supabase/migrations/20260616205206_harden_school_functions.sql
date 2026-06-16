-- Hardening for the school-system SECURITY DEFINER functions:
--   * Pin search_path to '' (all object references inside are schema-qualified)
--     to clear the function_search_path_mutable advisory.
--   * Remove anon EXECUTE (Supabase default privileges grant it at creation);
--     these functions all gate on auth.uid(), so anon could never act, but this
--     clears the anon_security_definer_function_executable advisory.

ALTER FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) SET search_path = '';
ALTER FUNCTION public.request_reward_redemption(uuid) SET search_path = '';
ALTER FUNCTION public.resolve_reward_redemption(uuid, text) SET search_path = '';
ALTER FUNCTION public.get_class_roster(uuid) SET search_path = '';
ALTER FUNCTION public.create_door_distribution(uuid, uuid, uuid, integer, text) SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_reward_redemption(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.resolve_reward_redemption(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_class_roster(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_door_distribution(uuid, uuid, uuid, integer, text) FROM anon;
