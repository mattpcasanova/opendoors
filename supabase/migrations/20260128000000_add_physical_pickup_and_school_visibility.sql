-- Migration: Add physical pickup rewards and school visibility features
-- Date: 2026-01-28

-- ============================================================================
-- FEATURE 1: Physical Pickup Rewards
-- ============================================================================

-- First, update the check constraint to include 'pickup' as valid redemption_method
-- (The original constraint only allowed 'code', 'qr', 'email')
ALTER TABLE prizes DROP CONSTRAINT IF EXISTS prizes_redemption_method_check;
ALTER TABLE prizes ADD CONSTRAINT prizes_redemption_method_check
  CHECK (redemption_method IN ('code', 'qr', 'email', 'pickup'));

-- Add pickup-specific fields to prizes table
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS pickup_instructions TEXT;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS pickup_contact TEXT;

-- Add collected_at to user_rewards to track when physical reward was picked up
-- (separate from claimed_at which tracks survey completion)
ALTER TABLE user_rewards ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ;

-- ============================================================================
-- FEATURE 2: School-Specific Prize Visibility
-- ============================================================================

-- Add school restriction fields to prizes table
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS is_school_restricted BOOLEAN DEFAULT false;
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS allowed_email_domains TEXT[];

-- Helper function to extract user's email domain
CREATE OR REPLACE FUNCTION get_user_email_domain()
RETURNS TEXT AS $$
  SELECT split_part(email, '@', 2)
  FROM user_profiles
  WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- UPDATE ACTIVE_GAMES VIEW
-- ============================================================================

-- Drop and recreate active_games view with school filtering
DROP VIEW IF EXISTS active_games;

CREATE OR REPLACE VIEW active_games AS
SELECT
  p.id,
  p.name,
  p.description,
  p.value,
  p.image_url,
  p.prize_type,
  p.redemption_method,
  p.stock_quantity,
  p.is_active,
  p.expires_at,
  p.created_at,
  p.category,
  p.doors,
  p.address,
  p.location_name,
  p.is_special,
  p.pickup_instructions,
  p.pickup_contact,
  p.is_school_restricted,
  p.allowed_email_domains,
  s.name AS company_name,
  s.logo_url
FROM prizes p
LEFT JOIN sponsors s ON p.sponsor_id = s.id
WHERE p.is_active = true
  AND (p.expires_at IS NULL OR p.expires_at > NOW())
  AND (p.stock_quantity IS NULL OR p.stock_quantity > 0)
  -- School visibility filter: show if not restricted OR if user's email domain matches
  AND (
    p.is_school_restricted = false
    OR p.is_school_restricted IS NULL
    OR get_user_email_domain() = ANY(p.allowed_email_domains)
  );

-- Grant access to the view
GRANT SELECT ON active_games TO authenticated;

-- ============================================================================
-- FEATURE 3: Stock Decrement on Win
-- ============================================================================

-- Function to decrement stock when a prize is won
-- This runs regardless of whether the prize uses code pools
CREATE OR REPLACE FUNCTION decrement_prize_stock(p_prize_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prizes
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - 1),
      updated_at = NOW()
  WHERE id = p_prize_id
    AND stock_quantity IS NOT NULL
    AND stock_quantity > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION decrement_prize_stock(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN prizes.pickup_instructions IS 'Instructions for physical pickup rewards (e.g., "Show this screen to Mr. Casanova")';
COMMENT ON COLUMN prizes.pickup_contact IS 'Contact person for physical pickup (e.g., "Mr. Casanova")';
COMMENT ON COLUMN prizes.is_school_restricted IS 'When true, only users with matching email domains can see this prize';
COMMENT ON COLUMN prizes.allowed_email_domains IS 'Array of email domains allowed to see this prize (e.g., ["somerset.colegia.org", "somersetacademy.com"])';
COMMENT ON COLUMN user_rewards.collected_at IS 'Timestamp when user physically collected the reward (before redemption survey)';
