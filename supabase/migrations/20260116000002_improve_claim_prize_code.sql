-- Migration: Improve claim_prize_code to return code even when already claimed
-- This allows cashiers to view the code again if they scan the QR multiple times

-- Drop the existing function first (return type changed)
DROP FUNCTION IF EXISTS claim_prize_code(UUID);

CREATE OR REPLACE FUNCTION claim_prize_code(p_code_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT,
  code TEXT,
  prize_name TEXT,
  prize_description TEXT,
  sponsor_logo TEXT,
  sponsor_name TEXT,
  already_claimed BOOLEAN
) AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  -- Get the code with prize and sponsor info
  SELECT
    pc.id,
    pc.code,
    pc.status,
    pc.expires_at,
    pc.claimed_at,
    p.name AS prize_name,
    p.description AS prize_description,
    p.logo_url AS prize_logo,
    s.logo_url AS sponsor_logo,
    s.name AS sponsor_name
  INTO v_code_record
  FROM prize_codes pc
  JOIN prizes p ON p.id = pc.prize_id
  LEFT JOIN sponsors s ON s.id = p.sponsor_id
  WHERE pc.id = p_code_id;

  -- Check if code exists
  IF v_code_record.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid reward code'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if already claimed - still return the code so cashier can see it
  IF v_code_record.status = 'claimed' THEN
    RETURN QUERY SELECT
      TRUE,  -- success = true so we show the code
      'This reward was previously redeemed'::TEXT,
      v_code_record.code,
      v_code_record.prize_name,
      v_code_record.prize_description,
      COALESCE(v_code_record.sponsor_logo, v_code_record.prize_logo),
      v_code_record.sponsor_name,
      TRUE;  -- already_claimed flag
    RETURN;
  END IF;

  -- Check if expired
  IF v_code_record.status = 'expired' OR (v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW()) THEN
    RETURN QUERY SELECT FALSE, 'This reward has expired'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if not assigned (shouldn't happen via normal flow)
  IF v_code_record.status = 'available' THEN
    RETURN QUERY SELECT FALSE, 'Invalid reward code'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Mark as claimed
  UPDATE prize_codes
  SET status = 'claimed',
      claimed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_code_id;

  -- Return success with code details
  RETURN QUERY SELECT
    TRUE,
    NULL::TEXT,
    v_code_record.code,
    v_code_record.prize_name,
    v_code_record.prize_description,
    COALESCE(v_code_record.sponsor_logo, v_code_record.prize_logo),
    v_code_record.sponsor_name,
    FALSE;  -- not already_claimed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant execute permission (function signature changed)
GRANT EXECUTE ON FUNCTION claim_prize_code(UUID) TO anon, authenticated;
