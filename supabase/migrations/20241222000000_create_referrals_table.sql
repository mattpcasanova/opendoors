-- Create referrals table to track referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  referred_played_first_game BOOLEAN NOT NULL DEFAULT FALSE,
  referrer_rewarded BOOLEAN NOT NULL DEFAULT FALSE,
  referred_rewarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  first_game_played_at TIMESTAMP WITH TIME ZONE NULL,
  rewards_granted_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT referrals_unique_referral UNIQUE (referrer_id, referred_id),
  CONSTRAINT referrals_code_unique UNIQUE (referral_code)
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals USING btree (referrer_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals USING btree (referred_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals USING btree (referral_code) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_pending ON public.referrals USING btree (referrer_id, referred_played_first_game, referrer_rewarded) 
  WHERE referrer_rewarded = FALSE AND referred_played_first_game = TRUE;

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view referrals they are part of" ON public.referrals
  FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals" ON public.referrals
  FOR UPDATE
  USING (true);

-- Add referral_code to user_profiles for easy lookup
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles USING btree (referral_code) 
  WHERE referral_code IS NOT NULL;

-- Add referred_by_id to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS referred_by_id UUID NULL;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_referred_by_id_fkey 
  FOREIGN KEY (referred_by_id) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON public.user_profiles USING btree (referred_by_id) TABLESPACE pg_default;

-- Comments
COMMENT ON TABLE public.referrals IS 'Tracks referral relationships and rewards';
COMMENT ON COLUMN public.referrals.referral_code IS 'Unique referral code used in share URL';
COMMENT ON COLUMN public.referrals.referred_played_first_game IS 'Whether the referred user has played their first game';
COMMENT ON COLUMN public.referrals.referrer_rewarded IS 'Whether the referrer has been rewarded';
COMMENT ON COLUMN public.referrals.referred_rewarded IS 'Whether the referred user has been rewarded';
COMMENT ON COLUMN public.user_profiles.referral_code IS 'User''s unique referral code for sharing';
COMMENT ON COLUMN public.user_profiles.referred_by_id IS 'ID of the user who referred this user';

