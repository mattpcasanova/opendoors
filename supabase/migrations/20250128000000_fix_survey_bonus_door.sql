-- Fix survey submission to NOT grant bonus doors
-- Survey rewards are handled as earned rewards in the application layer
-- Only the 5-game progress should grant bonus doors

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
BEGIN
  -- Verify user_id matches authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User ID does not match authenticated user';
  END IF;

  -- Verify reward_id exists if provided (optional check)
  IF p_reward_id IS NOT NULL THEN
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM public.user_rewards
        WHERE id = p_reward_id
        AND user_id = p_user_id
      ) INTO v_reward_exists;

      IF NOT v_reward_exists THEN
        p_reward_id := NULL;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
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
      false  -- Survey does NOT grant bonus doors
    )
    RETURNING id INTO v_survey_id;
  EXCEPTION
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Foreign key constraint violation. Reward ID: %, Prize ID: %', p_reward_id, p_prize_id;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error inserting survey: %', SQLERRM;
  END;

  -- Survey rewards are handled as earned rewards in the application layer
  -- They do NOT grant bonus doors - only the 5-game progress does that

  RETURN v_survey_id;
END;
$$;

-- Grant execute permission
REVOKE ALL ON FUNCTION public.submit_redemption_survey(UUID, UUID, UUID, BOOLEAN, TEXT, TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_redemption_survey(UUID, UUID, UUID, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.submit_redemption_survey(UUID, UUID, UUID, BOOLEAN, TEXT, TEXT, TEXT) IS 'Submit redemption survey - rewards handled as earned rewards, not bonus doors - SECURITY DEFINER';
