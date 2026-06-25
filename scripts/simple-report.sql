-- Simple Report - games, rewards, and post-redemption answers
--
-- WARNING: In this Supabase project, game_plays / user_rewards / redemption_surveys
-- are all empty (0 rows). Every query below will return zeros. If the school pilot's
-- play and redemption data lives somewhere else, run these against that project.


-- 1. Games played, rewards won, rewards claimed
SELECT
  (SELECT COUNT(*) FROM game_plays)                                     AS games_played,
  (SELECT COUNT(*) FROM user_rewards)                                   AS rewards_won,
  (SELECT COUNT(*) FROM user_rewards WHERE claimed_at IS NOT NULL)      AS rewards_claimed,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM user_rewards WHERE claimed_at IS NOT NULL) /
    NULLIF((SELECT COUNT(*) FROM user_rewards), 0)
  , 1) AS pct_claimed_of_won;


-- 2. Would they come back to the restaurant? (post-redemption survey)
SELECT
  will_return,
  COUNT(*)                                          AS responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM redemption_surveys
GROUP BY will_return
ORDER BY
  CASE will_return WHEN 'yes' THEN 1 WHEN 'maybe' THEN 2 WHEN 'no' THEN 3 ELSE 99 END;


-- 3. Did they buy anything else?
SELECT
  made_purchase,
  COUNT(*)                                          AS responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM redemption_surveys
GROUP BY made_purchase
ORDER BY made_purchase DESC;


-- 4. If they bought something, how much did they spend?
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
