-- Create a function to bypass RLS for door distributions
-- This function runs with SECURITY DEFINER, so it bypasses RLS

CREATE OR REPLACE FUNCTION create_door_distribution(
  p_distributor_id UUID,
  p_recipient_id UUID,
  p_organization_id UUID,
  p_doors_sent INTEGER,
  p_reason TEXT
)
RETURNS TABLE(
  id UUID,
  distributor_id UUID,
  recipient_id UUID,
  organization_id UUID,
  doors_sent INTEGER,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the distribution record
  INSERT INTO public.door_distributions (
    distributor_id,
    recipient_id,
    organization_id,
    doors_sent,
    reason
  ) VALUES (
    p_distributor_id,
    p_recipient_id,
    p_organization_id,
    p_doors_sent,
    p_reason
  );
  
  -- Return the inserted record
  RETURN QUERY
  SELECT 
    d.id,
    d.distributor_id,
    d.recipient_id,
    d.organization_id,
    d.doors_sent,
    d.reason,
    d.created_at
  FROM public.door_distributions d
  WHERE d.distributor_id = p_distributor_id
    AND d.recipient_id = p_recipient_id
    AND d.organization_id = p_organization_id
    AND d.doors_sent = p_doors_sent
    AND d.reason = p_reason
  ORDER BY d.created_at DESC
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_door_distribution(UUID, UUID, UUID, INTEGER, TEXT) TO authenticated;
