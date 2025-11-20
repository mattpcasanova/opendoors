-- Update get_distributor_history to include recipient names
-- This uses SECURITY DEFINER to bypass RLS and join with user_profiles

-- Drop the existing function first since we're changing the return type
DROP FUNCTION IF EXISTS public.get_distributor_history(uuid);

-- Create the new function with recipient names
CREATE FUNCTION public.get_distributor_history(p_distributor_id uuid)
RETURNS TABLE (
  id uuid,
  distributor_id uuid,
  recipient_id uuid,
  organization_id uuid,
  doors_sent integer,
  reason text,
  created_at timestamp with time zone,
  recipient_name text,
  recipient_email text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    dd.id,
    dd.distributor_id,
    dd.recipient_id,
    dd.organization_id,
    dd.doors_sent,
    dd.reason,
    dd.created_at,
    COALESCE(
      NULLIF(TRIM(COALESCE(up.first_name, '') || ' ' || COALESCE(up.last_name, '')), ''),
      up.email,
      'Unknown'
    ) as recipient_name,
    COALESCE(up.email, '') as recipient_email
  FROM public.door_distributions dd
  LEFT JOIN public.user_profiles up ON dd.recipient_id = up.id
  WHERE dd.distributor_id = p_distributor_id
  ORDER BY dd.created_at DESC;
$$;

-- Grant execute permission
REVOKE ALL ON FUNCTION public.get_distributor_history(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_distributor_history(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_distributor_history(uuid) IS 'Return door_distributions with recipient names for the given distributor_id (SECURITY DEFINER)';

