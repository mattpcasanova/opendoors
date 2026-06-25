-- Survey & Redemption Report
-- Run each block in the Supabase SQL editor. Time range: all time.
--
-- Tables involved:
--   user_survey_answers  - onboarding survey (reward_style, reward_types,
--                          social_sharing, category_ratings JSONB, discovery_source)
--   redemption_surveys   - post-redemption survey (made_purchase, spend_amount,
--                          will_return, discovery_source, bonus_door_granted)
--   user_rewards         - rewards a user has won (claimed_at IS NOT NULL = redeemed)
--   prizes               - prize catalog (name, location_name, category, value, prize_type)
--   game_plays           - per-game outcomes (win, switched, prize_id)


-- =============================================================================
-- SECTION 1 - REDEMPTION OF WON REWARDS
-- =============================================================================

-- 1.1 Overall redemption funnel
SELECT
  COUNT(*)                                             AS rewards_won,
  COUNT(claimed_at)                                    AS rewards_redeemed,
  COUNT(*) - COUNT(claimed_at)                         AS rewards_unredeemed,
  ROUND(100.0 * COUNT(claimed_at) / NULLIF(COUNT(*),0), 1) AS redemption_rate_pct,
  COUNT(*) FILTER (
    WHERE claimed_at IS NULL AND expires_at IS NOT NULL AND expires_at < CURRENT_DATE
  ) AS expired_unredeemed
FROM user_rewards;

-- 1.2 Redemption rate by sponsor / prize
SELECT
  p.location_name,
  p.name AS prize_name,
  p.category,
  COUNT(ur.id)                                                AS won,
  COUNT(ur.claimed_at)                                        AS redeemed,
  ROUND(100.0 * COUNT(ur.claimed_at) / NULLIF(COUNT(ur.id),0), 1) AS redemption_rate_pct
FROM user_rewards ur
JOIN prizes p ON p.id = ur.prize_id
GROUP BY p.id, p.location_name, p.name, p.category
ORDER BY won DESC;

-- 1.3 Redemption rate by category
SELECT
  COALESCE(p.category, 'uncategorized') AS category,
  COUNT(ur.id)                          AS won,
  COUNT(ur.claimed_at)                  AS redeemed,
  ROUND(100.0 * COUNT(ur.claimed_at) / NULLIF(COUNT(ur.id),0), 1) AS redemption_rate_pct
FROM user_rewards ur
JOIN prizes p ON p.id = ur.prize_id
GROUP BY p.category
ORDER BY won DESC;

-- 1.4 Redemption rate by month won
SELECT
  date_trunc('month', ur.created_at)::date AS month_won,
  COUNT(*)                                 AS won,
  COUNT(claimed_at)                        AS redeemed,
  ROUND(100.0 * COUNT(claimed_at) / NULLIF(COUNT(*),0), 1) AS redemption_rate_pct
FROM user_rewards ur
GROUP BY 1
ORDER BY 1;

-- 1.5 Time-to-redeem (hours) for rewards that were redeemed
SELECT
  COUNT(*)                                                                AS redeemed_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (claimed_at - created_at)) / 3600)::numeric, 1) AS avg_hours_to_redeem,
  ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (claimed_at - created_at)) / 3600))::numeric, 1) AS median_hours_to_redeem,
  ROUND((PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (claimed_at - created_at)) / 3600))::numeric, 1) AS p90_hours_to_redeem
FROM user_rewards
WHERE claimed_at IS NOT NULL;

-- 1.6 Per-user redemption behavior (distribution)
WITH per_user AS (
  SELECT
    user_id,
    COUNT(*)                              AS won,
    COUNT(claimed_at)                     AS redeemed,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE 100.0 * COUNT(claimed_at) / COUNT(*) END AS rate
  FROM user_rewards
  GROUP BY user_id
)
SELECT
  COUNT(*)                                                          AS users_with_wins,
  ROUND(AVG(rate)::numeric, 1)                                      AS avg_user_redemption_rate_pct,
  COUNT(*) FILTER (WHERE redeemed = 0)                              AS users_never_redeemed,
  COUNT(*) FILTER (WHERE redeemed = won AND won > 0)                AS users_always_redeemed,
  ROUND(AVG(won)::numeric, 2)                                       AS avg_wins_per_user
FROM per_user;


-- =============================================================================
-- SECTION 2 - POST-REDEMPTION SURVEY (redemption_surveys)
-- =============================================================================

-- 2.1 Survey completion rate (vs total redemptions)
SELECT
  (SELECT COUNT(*) FROM user_rewards WHERE claimed_at IS NOT NULL)        AS total_redemptions,
  (SELECT COUNT(*) FROM redemption_surveys)                               AS surveys_submitted,
  ROUND(100.0 *
    (SELECT COUNT(*) FROM redemption_surveys) /
    NULLIF((SELECT COUNT(*) FROM user_rewards WHERE claimed_at IS NOT NULL), 0)
  , 1) AS survey_completion_rate_pct;

-- 2.2 Did the redemption drive a purchase?
SELECT
  made_purchase,
  COUNT(*)                                       AS responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM redemption_surveys
GROUP BY made_purchase
ORDER BY made_purchase DESC;

-- 2.3 Spend amount distribution (only when a purchase was made)
SELECT
  COALESCE(spend_amount, '(none)') AS spend_amount,
  COUNT(*)                         AS responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM redemption_surveys
WHERE made_purchase = true
GROUP BY spend_amount
ORDER BY
  CASE COALESCE(spend_amount, 'zz')
    WHEN 'under_5' THEN 1
    WHEN '5_10'    THEN 2
    WHEN '10_20'   THEN 3
    WHEN 'over_20' THEN 4
    ELSE 99
  END;

-- 2.4 Intent to return
SELECT
  will_return,
  COUNT(*)                                       AS responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM redemption_surveys
GROUP BY will_return
ORDER BY
  CASE will_return WHEN 'yes' THEN 1 WHEN 'maybe' THEN 2 WHEN 'no' THEN 3 ELSE 99 END;

-- 2.5 New customer vs existing (discovery_source on post-redemption survey)
SELECT
  COALESCE(discovery_source, '(unspecified)') AS discovery_source,
  COUNT(*)                                    AS responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM redemption_surveys
GROUP BY discovery_source
ORDER BY responses DESC;

-- 2.6 Bonus door grant rate (sanity check)
SELECT
  bonus_door_granted,
  COUNT(*) AS responses
FROM redemption_surveys
GROUP BY bonus_door_granted;

-- 2.7 Per-prize post-redemption breakdown
SELECT
  p.location_name,
  p.name AS prize_name,
  COUNT(*)                                                         AS surveys,
  ROUND(100.0 * COUNT(*) FILTER (WHERE made_purchase) / COUNT(*), 1)            AS purchase_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE will_return = 'yes') / COUNT(*), 1)      AS return_yes_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE discovery_source = 'opendoors') / COUNT(*), 1) AS new_via_opendoors_pct
FROM redemption_surveys rs
JOIN prizes p ON p.id = rs.prize_id
GROUP BY p.id, p.location_name, p.name
HAVING COUNT(*) >= 1
ORDER BY surveys DESC;


-- =============================================================================
-- SECTION 3 - ONBOARDING SURVEY (user_survey_answers)
-- =============================================================================

-- 3.1 reward_style preference
SELECT
  reward_style,
  COUNT(*)                                       AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY reward_style
ORDER BY users DESC;

-- 3.2 discovery_source (how users found OpenDoors)
SELECT
  COALESCE(discovery_source, '(unspecified)') AS discovery_source,
  COUNT(*)                                    AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY discovery_source
ORDER BY users DESC;

-- 3.3 social_sharing
SELECT
  COALESCE(social_sharing, '(unspecified)') AS social_sharing,
  COUNT(*)                                  AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY social_sharing
ORDER BY users DESC;

-- 3.4 reward_types (text[] unnested)
SELECT
  rt AS reward_type,
  COUNT(*)                                       AS users,
  ROUND(100.0 * COUNT(*) /
        (SELECT COUNT(*) FROM user_survey_answers WHERE reward_types IS NOT NULL AND array_length(reward_types,1) > 0), 1
  ) AS pct_of_responders
FROM user_survey_answers, unnest(reward_types) AS rt
GROUP BY rt
ORDER BY users DESC;

-- 3.5 category_ratings (JSONB: { "Food": 5, "Coffee": 4, ... }) - average rating per category
SELECT
  kv.key                                AS category,
  COUNT(*)                              AS raters,
  ROUND(AVG((kv.value)::numeric), 2)    AS avg_rating,
  COUNT(*) FILTER (WHERE (kv.value)::int >= 4) AS rated_4_or_5
FROM user_survey_answers usa,
     jsonb_each_text(usa.category_ratings) AS kv
WHERE usa.category_ratings IS NOT NULL
  AND jsonb_typeof(usa.category_ratings) = 'object'
GROUP BY kv.key
ORDER BY avg_rating DESC NULLS LAST;


-- =============================================================================
-- SECTION 4 - CROSSES (onboarding answers x redemption behavior)
-- =============================================================================

-- 4.1 Does onboarding reward_style predict actual redemption rate?
SELECT
  COALESCE(usa.reward_style, '(no survey)') AS reward_style,
  COUNT(DISTINCT ur.user_id)                AS users,
  COUNT(ur.id)                              AS rewards_won,
  COUNT(ur.claimed_at)                      AS rewards_redeemed,
  ROUND(100.0 * COUNT(ur.claimed_at) / NULLIF(COUNT(ur.id),0), 1) AS redemption_rate_pct
FROM user_rewards ur
LEFT JOIN user_survey_answers usa ON usa.user_id = ur.user_id
GROUP BY usa.reward_style
ORDER BY rewards_won DESC;

-- 4.2 Does onboarding discovery_source predict post-redemption purchase behavior?
SELECT
  COALESCE(usa.discovery_source, '(no survey)') AS onboarding_discovery,
  COUNT(rs.id)                                  AS surveys,
  ROUND(100.0 * COUNT(*) FILTER (WHERE rs.made_purchase) / NULLIF(COUNT(rs.id),0), 1) AS purchase_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE rs.will_return = 'yes') / NULLIF(COUNT(rs.id),0), 1) AS return_yes_pct
FROM redemption_surveys rs
LEFT JOIN user_survey_answers usa ON usa.user_id = rs.user_id
GROUP BY usa.discovery_source
ORDER BY surveys DESC;

-- 4.3 Did users redeem more often after completing the onboarding survey?
WITH user_buckets AS (
  SELECT
    ur.user_id,
    EXISTS (SELECT 1 FROM user_survey_answers usa WHERE usa.user_id = ur.user_id) AS completed_onboarding,
    COUNT(*)            AS won,
    COUNT(claimed_at)   AS redeemed
  FROM user_rewards ur
  GROUP BY ur.user_id
)
SELECT
  completed_onboarding,
  COUNT(*)                                                AS users,
  SUM(won)                                                AS total_won,
  SUM(redeemed)                                           AS total_redeemed,
  ROUND(100.0 * SUM(redeemed) / NULLIF(SUM(won),0), 1)    AS redemption_rate_pct
FROM user_buckets
GROUP BY completed_onboarding
ORDER BY completed_onboarding DESC;


-- =============================================================================
-- SECTION 5 - GAME OUTCOMES CONTEXT (game_plays)
-- =============================================================================

-- 5.1 Overall win rate, and "switched door" Monty-Hall effect
SELECT
  COUNT(*)                                                         AS total_plays,
  COUNT(*) FILTER (WHERE win)                                      AS wins,
  ROUND(100.0 * COUNT(*) FILTER (WHERE win) / NULLIF(COUNT(*),0), 1) AS win_rate_pct,
  COUNT(*) FILTER (WHERE switched)                                 AS switched_plays,
  ROUND(100.0 * COUNT(*) FILTER (WHERE switched AND win) /
        NULLIF(COUNT(*) FILTER (WHERE switched),0), 1)             AS switched_win_rate_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE NOT switched AND win) /
        NULLIF(COUNT(*) FILTER (WHERE NOT switched),0), 1)         AS stayed_win_rate_pct
FROM game_plays;

-- 5.2 Wins recorded in game_plays vs rewards persisted in user_rewards (sanity)
SELECT
  (SELECT COUNT(*) FROM game_plays   WHERE win) AS game_plays_wins,
  (SELECT COUNT(*) FROM user_rewards)           AS user_rewards_rows;
