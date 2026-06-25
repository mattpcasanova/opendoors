-- School Pilot Report (all time)
-- Flat per-user table + summary.
--
-- NOTE: In this project, user_rewards / redemption_surveys / game_plays / prizes
-- are all empty, so prize-related columns will be 0 / NULL. If the school's
-- redemption data lives in another Supabase project, re-run this against it.


-- =============================================================================
-- 1. FLAT PER-USER TABLE - one row per user
-- =============================================================================
SELECT
  up.id                                            AS user_id,
  up.email,
  split_part(up.email, '@', 2)                     AS email_domain,
  up.first_name,
  up.last_name,
  up.created_at                                    AS signed_up_at,
  up.user_type,
  up.has_completed_survey,
  up.referred_by_id IS NOT NULL                    AS was_referred,
  up.last_daily_play_date,

  -- Onboarding survey answers
  usa.reward_style,
  usa.discovery_source                             AS onboarding_discovery,
  usa.social_sharing,
  usa.reward_types,
  usa.category_ratings,

  -- Win / claim counts (will be 0 here since tables are empty)
  COALESCE(rewards.won, 0)                         AS rewards_won,
  COALESCE(rewards.claimed, 0)                     AS rewards_claimed,
  COALESCE(plays.games_played, 0)                  AS games_played,
  COALESCE(plays.wins, 0)                          AS games_won,
  COALESCE(surveys.post_redemption_surveys, 0)     AS post_redemption_surveys

FROM user_profiles up
LEFT JOIN user_survey_answers usa ON usa.user_id = up.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS won, COUNT(claimed_at) AS claimed
  FROM user_rewards WHERE user_id = up.id
) rewards ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS games_played, COUNT(*) FILTER (WHERE win) AS wins
  FROM game_plays WHERE user_id = up.id
) plays ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS post_redemption_surveys
  FROM redemption_surveys WHERE user_id = up.id
) surveys ON true
ORDER BY up.created_at;


-- =============================================================================
-- 2. SUMMARY
-- =============================================================================

-- 2.1 Headline numbers
SELECT
  COUNT(*)                                                            AS users_signed_up,
  COUNT(*) FILTER (WHERE has_completed_survey)                        AS surveys_completed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE has_completed_survey) /
        NULLIF(COUNT(*), 0), 1)                                       AS survey_completion_rate_pct,
  COUNT(*) FILTER (WHERE referred_by_id IS NOT NULL)                  AS came_via_referral,
  ROUND(100.0 * COUNT(*) FILTER (WHERE referred_by_id IS NOT NULL) /
        NULLIF(COUNT(*), 0), 1)                                       AS referral_share_pct,
  COUNT(DISTINCT split_part(email, '@', 2))                           AS distinct_email_domains
FROM user_profiles;

-- 2.2 Top email domains (proxy for which schools/orgs participated)
SELECT
  split_part(email, '@', 2) AS email_domain,
  COUNT(*)                  AS users,
  COUNT(*) FILTER (WHERE has_completed_survey) AS surveys_completed
FROM user_profiles
GROUP BY email_domain
ORDER BY users DESC;

-- 2.3 Reward style preference
SELECT
  COALESCE(reward_style, '(unspecified)') AS reward_style,
  COUNT(*)                                AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY reward_style
ORDER BY users DESC;

-- 2.4 Discovery source
SELECT
  COALESCE(discovery_source, '(unspecified)') AS discovery_source,
  COUNT(*)                                    AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY discovery_source
ORDER BY users DESC;

-- 2.5 Social sharing willingness
SELECT
  COALESCE(social_sharing, '(unspecified)') AS social_sharing,
  COUNT(*)                                  AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY social_sharing
ORDER BY users DESC;

-- 2.6 Preferred reward types (text[] unnested)
SELECT
  rt        AS reward_type,
  COUNT(*)  AS users
FROM user_survey_answers, unnest(reward_types) AS rt
GROUP BY rt
ORDER BY users DESC;

-- 2.7 Category ratings - which categories users care about most
SELECT
  kv.key                                       AS category,
  COUNT(*)                                     AS raters,
  ROUND(AVG((kv.value)::numeric), 2)           AS avg_rating,
  COUNT(*) FILTER (WHERE (kv.value)::int >= 4) AS rated_4_or_5,
  ROUND(100.0 * COUNT(*) FILTER (WHERE (kv.value)::int >= 4) /
        NULLIF(COUNT(*), 0), 1)                AS pct_high_interest
FROM user_survey_answers usa,
     jsonb_each_text(usa.category_ratings) AS kv
WHERE jsonb_typeof(usa.category_ratings) = 'object'
GROUP BY kv.key
ORDER BY avg_rating DESC NULLS LAST, raters DESC;

-- 2.8 Daily signups (for a chart)
SELECT
  date_trunc('day', created_at)::date AS signup_date,
  COUNT(*)                            AS signups,
  COUNT(*) FILTER (WHERE has_completed_survey) AS surveys_completed
FROM user_profiles
GROUP BY signup_date
ORDER BY signup_date;
