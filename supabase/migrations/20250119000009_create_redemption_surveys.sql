-- Create redemption_surveys table for post-redemption survey feature
-- This tracks survey responses after users claim rewards and grants +1 bonus door

CREATE TABLE public.redemption_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES user_rewards(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES prizes(id),

  -- Survey Responses
  made_purchase BOOLEAN NOT NULL,
  spend_amount TEXT, -- 'under_5', '5_10', '10_20', 'over_20', NULL if no purchase
  will_return TEXT NOT NULL, -- 'yes', 'maybe', 'no'
  discovery_source TEXT, -- 'existing', 'opendoors', 'referral', 'other'

  -- Reward Tracking
  bonus_door_granted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_redemption_surveys_user_id ON public.redemption_surveys(user_id);
CREATE INDEX idx_redemption_surveys_prize_id ON public.redemption_surveys(prize_id);
CREATE INDEX idx_redemption_surveys_created_at ON public.redemption_surveys(created_at DESC);

-- Enable RLS
ALTER TABLE public.redemption_surveys ENABLE ROW LEVEL SECURITY;

-- Users can read their own surveys
CREATE POLICY "Users can read their own surveys"
  ON public.redemption_surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own surveys
CREATE POLICY "Users can insert their own surveys"
  ON public.redemption_surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.redemption_surveys TO authenticated;

COMMENT ON TABLE public.redemption_surveys IS 'Stores post-redemption survey responses. Users get +1 bonus door for completing survey.';
