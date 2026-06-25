-- Onboarding Survey Report
-- Scoped to what's populated: user_survey_answers (114) + user_profiles (151).
-- user_rewards / redemption_surveys / game_plays / prizes are empty in this project.


-- =============================================================================
-- SECTION A - PARTICIPATION
-- =============================================================================

-- A.1 Survey completion vs total users
SELECT
  (SELECT COUNT(*) FROM user_profiles)                                     AS total_users,
  (SELECT COUNT(*) FROM user_survey_answers)                               AS surveys_submitted,
  (SELECT COUNT(*) FROM user_profiles WHERE has_completed_survey = true)   AS marked_completed,
  ROUND(100.0 * (SELECT COUNT(*) FROM user_survey_answers) /
        NULLIF((SELECT COUNT(*) FROM user_profiles), 0), 1)                AS survey_completion_rate_pct;

-- A.2 user_survey_answers rows without a matching profile (data quality check)
SELECT COUNT(*) AS orphaned_survey_rows
FROM user_survey_answers usa
LEFT JOIN user_profiles up ON up.id = usa.user_id
WHERE up.id IS NULL;


-- =============================================================================
-- SECTION B - SURVEY ANSWERS
-- =============================================================================

-- B.1 Reward style preference
SELECT
  COALESCE(reward_style, '(unspecified)') AS reward_style,
  COUNT(*)                                AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY reward_style
ORDER BY users DESC;

-- B.2 Discovery source (how users found OpenDoors)
SELECT
  COALESCE(discovery_source, '(unspecified)') AS discovery_source,
  COUNT(*)                                    AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY discovery_source
ORDER BY users DESC;

-- B.3 Social sharing willingness
SELECT
  COALESCE(social_sharing, '(unspecified)') AS social_sharing,
  COUNT(*)                                  AS users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM user_survey_answers
GROUP BY social_sharing
ORDER BY users DESC;

-- B.4 Reward types preferred (text[] unnested)
SELECT
  rt                                       AS reward_type,
  COUNT(*)                                 AS users,
  ROUND(100.0 * COUNT(*) /
        NULLIF((SELECT COUNT(*) FROM user_survey_answers
                WHERE reward_types IS NOT NULL
                  AND array_length(reward_types, 1) > 0), 0), 1) AS pct_of_responders
FROM user_survey_answers, unnest(reward_types) AS rt
GROUP BY rt
ORDER BY users DESC;

-- B.5 Category ratings (JSONB) - average and 4/5 share per category
SELECT
  kv.key                                       AS category,
  COUNT(*)                                     AS raters,
  ROUND(AVG((kv.value)::numeric), 2)           AS avg_rating,
  COUNT(*) FILTER (WHERE (kv.value)::int >= 4) AS rated_4_or_5,
  ROUND(100.0 * COUNT(*) FILTER (WHERE (kv.value)::int >= 4) / COUNT(*), 1) AS pct_4_or_5
FROM user_survey_answers usa,
     jsonb_each_text(usa.category_ratings) AS kv
WHERE usa.category_ratings IS NOT NULL
  AND jsonb_typeof(usa.category_ratings) = 'object'
GROUP BY kv.key
ORDER BY avg_rating DESC NULLS LAST, raters DESC;


-- =============================================================================
-- SECTION C - CROSSES
-- =============================================================================

-- C.1 Reward style x discovery source (heatmap-style)
SELECT
  COALESCE(reward_style, '(unspecified)')     AS reward_style,
  COALESCE(discovery_source, '(unspecified)') AS discovery_source,
  COUNT(*)                                    AS users
FROM user_survey_answers
GROUP BY reward_style, discovery_source
ORDER BY reward_style, users DESC;

-- C.2 Reward style x average category ratings
SELECT
  COALESCE(usa.reward_style, '(unspecified)') AS reward_style,
  kv.key                                      AS category,
  COUNT(*)                                    AS raters,
  ROUND(AVG((kv.value)::numeric), 2)          AS avg_rating
FROM user_survey_answers usa,
     jsonb_each_text(usa.category_ratings) AS kv
WHERE jsonb_typeof(usa.category_ratings) = 'object'
GROUP BY usa.reward_style, kv.key
ORDER BY reward_style, avg_rating DESC;


-- =============================================================================
-- SECTION D - REFERRAL / GROWTH CONTEXT (user_profiles)
-- =============================================================================

-- D.1 Did referred users complete the survey at a different rate?
SELECT
  CASE WHEN referred_by_id IS NULL THEN 'organic' ELSE 'referred' END AS source,
  COUNT(*)                                                             AS users,
  COUNT(*) FILTER (WHERE has_completed_survey)                         AS completed_survey,
  ROUND(100.0 * COUNT(*) FILTER (WHERE has_completed_survey) /
        NULLIF(COUNT(*), 0), 1)                                        AS completion_rate_pct
FROM user_profiles
GROUP BY source;

-- D.2 Discovery source self-report (survey) vs actually-referred + door usage
-- Cross-checks whether users who said "Friend or family" were actually referred,
-- and how many doors that cohort received vs claimed (spent).
WITH per_user_doors AS (
  SELECT
    recipient_id AS user_id,
    SUM(doors_sent) AS doors_received
  FROM door_distributions
  GROUP BY recipient_id
)
SELECT
  COALESCE(usa.discovery_source, '(unspecified)') AS self_reported_discovery,
  COUNT(*)                                        AS users,
  COUNT(*) FILTER (WHERE up.referred_by_id IS NOT NULL) AS actually_referred,
  ROUND(100.0 * COUNT(*) FILTER (WHERE up.referred_by_id IS NOT NULL) /
        NULLIF(COUNT(*), 0), 1)                   AS pct_actually_referred,
  COALESCE(SUM(d.doors_received), 0)              AS doors_received,
  COALESCE(SUM(d.doors_received), 0) - SUM(COALESCE(up.doors_available, 0)) AS doors_claimed,
  ROUND(
    100.0 *
    (COALESCE(SUM(d.doors_received), 0) - SUM(COALESCE(up.doors_available, 0))) /
    NULLIF(COALESCE(SUM(d.doors_received), 0), 0)
  , 1)                                            AS pct_doors_claimed
FROM user_survey_answers usa
JOIN user_profiles up ON up.id = usa.user_id
LEFT JOIN per_user_doors d ON d.user_id = up.id
GROUP BY usa.discovery_source
ORDER BY users DESC;

-- D.3 Door distribution & play summary (corrected: doors_available includes signup bonus,
-- so we can't compute "claimed" by subtraction. Use game_plays as the true play count.)
SELECT
  (SELECT COUNT(*) FROM user_profiles)                                        AS total_users,
  (SELECT COUNT(DISTINCT recipient_id) FROM door_distributions)               AS users_who_got_distributed_doors,
  (SELECT COALESCE(SUM(doors_sent), 0) FROM door_distributions)               AS total_doors_distributed,
  (SELECT COALESCE(SUM(doors_available), 0) FROM user_profiles)               AS doors_currently_held_by_users,
  (SELECT COUNT(*) FROM game_plays)                                           AS total_games_played,
  (SELECT COUNT(*) FROM user_rewards)                                         AS total_rewards_won,
  (SELECT COUNT(*) FROM user_rewards WHERE claimed_at IS NOT NULL)            AS total_rewards_claimed;

-- D.4 Doors distributed and currently held, by reward_style cohort
WITH cohort_users AS (
  SELECT DISTINCT up.id, usa.reward_style, up.doors_available
  FROM user_survey_answers usa
  JOIN user_profiles up ON up.id = usa.user_id
),
cohort_distributed AS (
  SELECT cu.reward_style, SUM(dd.doors_sent) AS doors_distributed
  FROM cohort_users cu
  JOIN door_distributions dd ON dd.recipient_id = cu.id
  GROUP BY cu.reward_style
)
SELECT
  COALESCE(cu.reward_style, '(unspecified)') AS reward_style,
  COUNT(*)                                   AS users_in_cohort,
  COUNT(*) FILTER (
    WHERE EXISTS (SELECT 1 FROM door_distributions dd WHERE dd.recipient_id = cu.id)
  )                                          AS users_who_got_distributed_doors,
  COALESCE(MAX(cd.doors_distributed), 0)     AS doors_distributed_to_cohort,
  SUM(COALESCE(cu.doors_available, 0))       AS doors_currently_held_by_cohort
FROM cohort_users cu
LEFT JOIN cohort_distributed cd ON cd.reward_style = cu.reward_style
GROUP BY cu.reward_style
ORDER BY users_in_cohort DESC;
