-- Fix referral code uniqueness constraint
-- Referral codes should be reusable (one user can refer multiple people)
-- The UNIQUE constraint on referral_code in referrals table is wrong - it prevents reuse

-- Remove the incorrect unique constraint on referral_code
ALTER TABLE public.referrals 
  DROP CONSTRAINT IF EXISTS referrals_code_unique;

-- The referral_code column should just store which code was used, but allow duplicates
-- Each referral relationship (referrer_id, referred_id) is still unique via referrals_unique_referral constraint
-- This allows one user to refer multiple people using the same referral code

COMMENT ON COLUMN public.referrals.referral_code IS 'Referral code that was used (can be reused by same referrer for multiple referrals)';

