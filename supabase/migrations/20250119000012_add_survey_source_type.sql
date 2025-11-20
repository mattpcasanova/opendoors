-- Add 'survey' to the source_type enum in earned_rewards table
-- This allows tracking survey completion rewards in the earned rewards history

-- Check if the constraint exists and the enum needs updating
DO $$
BEGIN
  -- Check if 'survey' is already in the check constraint
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'earned_rewards_source_type_check'
    AND conrelid = 'public.earned_rewards'::regclass
    AND pg_get_constraintdef(oid) LIKE '%survey%'
  ) THEN
    -- Drop the old check constraint if it exists
    ALTER TABLE public.earned_rewards
      DROP CONSTRAINT IF EXISTS earned_rewards_source_type_check;

    -- Add new check constraint with 'survey' included
    ALTER TABLE public.earned_rewards
      ADD CONSTRAINT earned_rewards_source_type_check
      CHECK (source_type IN ('ad_watch', 'referral', 'distributor', 'achievement', 'lesson', 'survey'));

    RAISE NOTICE 'Added survey to source_type enum';
  ELSE
    RAISE NOTICE 'Survey source_type already exists';
  END IF;
END $$;

COMMENT ON COLUMN public.earned_rewards.source_type IS 'Type of reward source: ad_watch, referral, distributor, achievement, lesson, or survey';
