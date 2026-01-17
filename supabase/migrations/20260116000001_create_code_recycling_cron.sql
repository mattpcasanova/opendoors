-- Migration: Create scheduled job to recycle expired/unclaimed prize codes
-- Codes that were assigned but not claimed within 10 days are returned to the pool

-- Create the recycling function
CREATE OR REPLACE FUNCTION recycle_expired_prize_codes()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Recycle codes that were assigned more than 10 days ago and not claimed
  -- 10 days = 7 days expiration + 3 days grace period
  UPDATE prize_codes
  SET status = 'available',
      assigned_to = NULL,
      assigned_at = NULL,
      expires_at = NULL,
      updated_at = NOW()
  WHERE status = 'assigned'
    AND assigned_at + INTERVAL '10 days' < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also mark expired codes that are still assigned as 'expired' first
  -- (This helps with tracking - codes go expired before being recycled)
  UPDATE prize_codes
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'assigned'
    AND expires_at < NOW()
    AND assigned_at + INTERVAL '10 days' >= NOW();

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION recycle_expired_prize_codes() TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION recycle_expired_prize_codes() IS 'Recycles prize codes that were assigned but not claimed within 10 days (7 day expiration + 3 day grace). Returns codes to available pool.';

-- NOTE: To schedule this function to run automatically, you have two options:
--
-- Option 1: If you have pg_cron enabled (Supabase Pro), run this in the SQL editor:
--   SELECT cron.schedule('recycle-expired-codes', '0 3 * * *', 'SELECT recycle_expired_prize_codes()');
--
-- Option 2: Create a Supabase Edge Function with a cron trigger or use an external scheduler
--   to call: SELECT recycle_expired_prize_codes();
--
-- Option 3: Manually run the function periodically:
--   SELECT recycle_expired_prize_codes();
