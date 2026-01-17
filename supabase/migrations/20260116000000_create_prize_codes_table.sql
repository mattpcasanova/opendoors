-- Migration: Create prize_codes table for gift certificate code management
-- This table stores individual redemption codes provided by business partners (e.g., Chick-fil-A)

-- Create enum type for code status
CREATE TYPE prize_code_status AS ENUM ('available', 'assigned', 'claimed', 'expired');

-- Create the prize_codes table
CREATE TABLE prize_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,  -- The actual redemption code (e.g., "CFA-7X9K2M")
  status prize_code_status NOT NULL DEFAULT 'available',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- When the assignment expires (7 days after assignment)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_prize_codes_prize_id ON prize_codes(prize_id);
CREATE INDEX idx_prize_codes_status ON prize_codes(status);
CREATE INDEX idx_prize_codes_assigned_to ON prize_codes(assigned_to);
CREATE INDEX idx_prize_codes_expires_at ON prize_codes(expires_at) WHERE status = 'assigned';

-- Ensure unique codes per prize (same code can exist for different prizes)
CREATE UNIQUE INDEX idx_prize_codes_code_per_prize ON prize_codes(prize_id, code);

-- Enable Row Level Security
ALTER TABLE prize_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own assigned codes
CREATE POLICY "Users can view own codes" ON prize_codes
  FOR SELECT USING (assigned_to = auth.uid());

-- Service role can do everything (for admin operations and Edge Functions)
CREATE POLICY "Service role full access" ON prize_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Function to sync prize stock_quantity based on available codes
CREATE OR REPLACE FUNCTION sync_prize_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate stock based on available codes
  UPDATE prizes
  SET stock_quantity = (
    SELECT COUNT(*) FROM prize_codes
    WHERE prize_id = COALESCE(NEW.prize_id, OLD.prize_id)
    AND status = 'available'
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.prize_id, OLD.prize_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync stock when codes are inserted, updated, or deleted
CREATE TRIGGER trigger_sync_prize_stock
AFTER INSERT OR UPDATE OR DELETE ON prize_codes
FOR EACH ROW EXECUTE FUNCTION sync_prize_stock();

-- Function to assign an available code to a user when they win
CREATE OR REPLACE FUNCTION assign_prize_code(p_prize_id UUID, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_code_id UUID;
BEGIN
  -- Find and lock an available code (SKIP LOCKED prevents race conditions)
  SELECT id INTO v_code_id
  FROM prize_codes
  WHERE prize_id = p_prize_id AND status = 'available'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If no code available, return NULL (caller should handle this gracefully)
  IF v_code_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Assign the code to the user
  UPDATE prize_codes
  SET status = 'assigned',
      assigned_to = p_user_id,
      assigned_at = NOW(),
      expires_at = NOW() + INTERVAL '7 days',
      updated_at = NOW()
  WHERE id = v_code_id;

  RETURN v_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim a code (called when QR is scanned)
CREATE OR REPLACE FUNCTION claim_prize_code(p_code_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT,
  code TEXT,
  prize_name TEXT,
  prize_description TEXT,
  sponsor_logo TEXT,
  sponsor_name TEXT
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
    p.name AS prize_name,
    p.description AS prize_description,
    s.logo_url AS sponsor_logo,
    s.name AS sponsor_name
  INTO v_code_record
  FROM prize_codes pc
  JOIN prizes p ON p.id = pc.prize_id
  LEFT JOIN sponsors s ON s.id = p.sponsor_id
  WHERE pc.id = p_code_id;

  -- Check if code exists
  IF v_code_record.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid reward code'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if already claimed
  IF v_code_record.status = 'claimed' THEN
    RETURN QUERY SELECT FALSE, 'This reward has already been redeemed'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if expired
  IF v_code_record.status = 'expired' OR (v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW()) THEN
    RETURN QUERY SELECT FALSE, 'This reward has expired'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if not assigned (shouldn't happen via normal flow)
  IF v_code_record.status = 'available' THEN
    RETURN QUERY SELECT FALSE, 'Invalid reward code'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
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
    v_code_record.sponsor_logo,
    v_code_record.sponsor_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk insert prize codes (for admin use via SQL editor)
CREATE OR REPLACE FUNCTION bulk_insert_prize_codes(
  p_prize_id UUID,
  p_codes TEXT[]
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO prize_codes (prize_id, code)
  SELECT p_prize_id, unnest(p_codes)
  ON CONFLICT (prize_id, code) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION assign_prize_code(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_prize_code(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION bulk_insert_prize_codes(UUID, TEXT[]) TO authenticated;

-- Add prize_code_id column to user_rewards to link rewards to specific codes
ALTER TABLE user_rewards ADD COLUMN IF NOT EXISTS prize_code_id UUID REFERENCES prize_codes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_user_rewards_prize_code_id ON user_rewards(prize_code_id);

-- Comment for documentation
COMMENT ON TABLE prize_codes IS 'Stores individual gift certificate/redemption codes provided by business partners';
COMMENT ON COLUMN prize_codes.code IS 'The actual redemption code from the partner (e.g., CFA-7X9K2M)';
COMMENT ON COLUMN prize_codes.status IS 'Code lifecycle: available (in pool) -> assigned (won by user) -> claimed (redeemed at business)';
COMMENT ON COLUMN prize_codes.expires_at IS 'When the user assignment expires (7 days after winning). Code returns to pool if not claimed.';
