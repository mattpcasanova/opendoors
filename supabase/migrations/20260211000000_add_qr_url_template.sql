-- Migration: Add qr_url_template to prizes for custom QR code URLs
-- This allows prizes to specify a URL pattern (e.g., https://crumbl.com/voucher/{code})
-- instead of using the default edge function redemption endpoint

-- Add qr_url_template column to prizes
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS qr_url_template TEXT;
COMMENT ON COLUMN prizes.qr_url_template IS 'URL template for QR codes. Use {code} placeholder. Example: https://crumbl.com/voucher/{code}';

-- Drop the old function first (it had a different return type: UUID instead of TABLE)
DROP FUNCTION IF EXISTS assign_prize_code(UUID, UUID);

-- Update assign_prize_code to return both the code ID and actual code value
-- This allows the app to construct the QR URL using the template
CREATE OR REPLACE FUNCTION assign_prize_code(p_prize_id UUID, p_user_id UUID)
RETURNS TABLE(code_id UUID, code_value TEXT) AS $$
DECLARE
  v_code_id UUID;
  v_code_value TEXT;
BEGIN
  -- Find and lock an available code (SKIP LOCKED prevents race conditions)
  SELECT id, code INTO v_code_id, v_code_value
  FROM prize_codes
  WHERE prize_id = p_prize_id AND status = 'available'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If no code available, return empty (caller should handle this gracefully)
  IF v_code_id IS NULL THEN
    RETURN;
  END IF;

  -- Assign the code to the user
  UPDATE prize_codes
  SET status = 'assigned',
      assigned_to = p_user_id,
      assigned_at = NOW(),
      expires_at = NOW() + INTERVAL '7 days',
      updated_at = NOW()
  WHERE id = v_code_id;

  RETURN QUERY SELECT v_code_id, v_code_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION assign_prize_code(UUID, UUID) TO authenticated;
