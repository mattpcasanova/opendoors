-- Fix RLS policies for redemption_surveys table
-- Create RPC function with SECURITY DEFINER to handle survey submission

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own surveys" ON public.redemption_surveys;
DROP POLICY IF EXISTS "Users can insert their own surveys" ON public.redemption_surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON public.redemption_surveys;

-- Ensure RLS is enabled
ALTER TABLE public.redemption_surveys ENABLE ROW LEVEL SECURITY;

-- Make reward_id nullable in the table (it's not strictly required for the survey)
-- This allows surveys to be submitted even if the reward_id doesn't exist or is invalid
DO $$
BEGIN
  -- Check if column is NOT NULL before altering
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'redemption_surveys' 
    AND column_name = 'reward_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.redemption_surveys 
      ALTER COLUMN reward_id DROP NOT NULL;
  END IF;
END $$;

-- Users can read their own surveys
CREATE POLICY "Users can read their own surveys"
  ON public.redemption_surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RPC function to submit survey (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.submit_redemption_survey(
  p_user_id UUID,
  p_reward_id UUID,
  p_prize_id UUID,
  p_made_purchase BOOLEAN,
  p_spend_amount TEXT,
  p_will_return TEXT,
  p_discovery_source TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_survey_id UUID;
  v_reward_exists BOOLEAN;
  v_bonus_doors INTEGER;
BEGIN
  -- Verify user_id matches authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID does not match authenticated user';
  END IF;

  -- Verify reward_id exists if provided (optional check)
  -- If reward doesn't exist or doesn't belong to user, set to NULL to avoid FK constraint violation
  IF p_reward_id IS NOT NULL THEN
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM public.user_rewards 
        WHERE id = p_reward_id 
        AND user_id = p_user_id
      ) INTO v_reward_exists;
      
      IF NOT v_reward_exists THEN
        -- If reward doesn't exist, set to NULL (survey can still be submitted)
        p_reward_id := NULL;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If any error occurs checking reward, set to NULL
        p_reward_id := NULL;
    END;
  END IF;

  -- Verify prize_id exists
  IF NOT EXISTS(SELECT 1 FROM public.prizes WHERE id = p_prize_id) THEN
    RAISE EXCEPTION 'Prize ID does not exist: %', p_prize_id;
  END IF;

  -- Insert survey response
  BEGIN
    INSERT INTO public.redemption_surveys (
      user_id,
      reward_id,
      prize_id,
      made_purchase,
      spend_amount,
      will_return,
      discovery_source,
      bonus_door_granted
    ) VALUES (
      p_user_id,
      p_reward_id,
      p_prize_id,
      p_made_purchase,
      p_spend_amount,
      p_will_return,
      p_discovery_source,
      true
    )
    RETURNING id INTO v_survey_id;
  EXCEPTION
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Foreign key constraint violation. Reward ID: %, Prize ID: %', p_reward_id, p_prize_id;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error inserting survey: %', SQLERRM;
  END;

  -- Grant +1 bonus door
  UPDATE public.user_profiles
  SET bonus_plays_available = COALESCE(bonus_plays_available, 0) + 1
  WHERE id = p_user_id;

  -- Get updated bonus doors count
  SELECT bonus_plays_available INTO v_bonus_doors
  FROM public.user_profiles
  WHERE id = p_user_id;

  RETURN v_survey_id;
END;
$$;

-- Grant execute permission
REVOKE ALL ON FUNCTION public.submit_redemption_survey(UUID, UUID, UUID, BOOLEAN, TEXT, TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_redemption_survey(UUID, UUID, UUID, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.submit_redemption_survey(UUID, UUID, UUID, BOOLEAN, TEXT, TEXT, TEXT) IS 'Submit redemption survey and grant +1 bonus door (SECURITY DEFINER)';

-- Grant permissions on table
GRANT SELECT, INSERT ON public.redemption_surveys TO authenticated;

