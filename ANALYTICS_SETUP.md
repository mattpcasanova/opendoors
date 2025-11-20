# Analytics Setup Guide

## Overview
Basic analytics tracking has been added to track 5 key user events to help understand app usage and retention.

## Database Migration Required

Run this migration to create the analytics_events table:

```bash
npx supabase db push
```

This will apply: `supabase/migrations/20250119000001_create_analytics_events.sql`

## Events Tracked

### 1. User Signup
- **Event:** `user_signup`
- **When:** User completes signup
- **Data:** hasReferralCode, signupMethod
- **Location:** `src/hooks/useAuth.tsx`

### 2. First Game Played
- **Event:** `first_game_played`
- **When:** User plays their very first game
- **Data:** prizeName, prizeCategory
- **Location:** `src/screens/main/HomeScreen.tsx`

### 3. First Win
- **Event:** `first_win`
- **When:** User wins their first game
- **Data:** prizeName, prizeValue
- **Location:** `src/screens/main/HomeScreen.tsx`

### 4. Referral Shared
- **Event:** `referral_shared`
- **When:** User shares their referral code
- **Data:** shareMethod ('share' or 'copy')
- **Location:** `src/components/modals/EarnRewardModal.tsx`

### 5. Game Played (All Games)
- **Event:** `game_played`
- **When:** User plays any game (not just first)
- **Data:** prizeName, prizeCategory, won
- **Location:** `src/screens/main/HomeScreen.tsx`

### Bonus Events

#### Ad Watched
- **Event:** `ad_watched`
- **When:** User watches a rewarded ad
- **Data:** completed, doorsEarned
- **Usage:** `analyticsService.trackAdWatched(userId, { completed: true, doorsEarned: 1 })`

#### Daily Return
- **Event:** `daily_return`
- **When:** User opens app on different day
- **Data:** daysSinceLastVisit
- **Usage:** `analyticsService.trackDailyReturn(userId, { daysSinceLastVisit: 2 })`

## Querying Analytics

### Most Active Users
```sql
SELECT
  user_id,
  COUNT(*) as event_count
FROM analytics_events
GROUP BY user_id
ORDER BY event_count DESC
LIMIT 10;
```

### Signup to First Game Conversion
```sql
WITH signups AS (
  SELECT user_id, MIN(created_at) as signup_time
  FROM analytics_events
  WHERE event_name = 'user_signup'
  GROUP BY user_id
),
first_games AS (
  SELECT user_id, MIN(created_at) as first_game_time
  FROM analytics_events
  WHERE event_name = 'first_game_played'
  GROUP BY user_id
)
SELECT
  COUNT(DISTINCT s.user_id) as total_signups,
  COUNT(DISTINCT f.user_id) as played_first_game,
  ROUND(100.0 * COUNT(DISTINCT f.user_id) / COUNT(DISTINCT s.user_id), 2) as conversion_rate
FROM signups s
LEFT JOIN first_games f ON s.user_id = f.user_id;
```

### Win Rate by Category
```sql
SELECT
  event_data->>'prizeCategory' as category,
  COUNT(*) as games_played,
  SUM(CASE WHEN (event_data->>'won')::boolean THEN 1 ELSE 0 END) as wins,
  ROUND(100.0 * SUM(CASE WHEN (event_data->>'won')::boolean THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate
FROM analytics_events
WHERE event_name = 'game_played'
GROUP BY event_data->>'prizeCategory'
ORDER BY games_played DESC;
```

### Referral Effectiveness
```sql
SELECT
  COUNT(*) as referrals_shared,
  COUNT(DISTINCT user_id) as unique_sharers
FROM analytics_events
WHERE event_name = 'referral_shared';
```

### Daily Active Users
```sql
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as daily_active_users
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Privacy & Security

- ✅ RLS enabled - users can only insert their own events
- ✅ Users can read their own events (for debugging)
- ✅ Analytics failures don't break the app (caught errors)
- ✅ No PII stored beyond user_id (which is already in auth.users)

## Next Steps (Optional)

1. **Dashboard:** Build a simple analytics dashboard in Supabase or with a tool like Metabase
2. **Retention Analysis:** Track daily/weekly/monthly retention rates
3. **Cohort Analysis:** Group users by signup week and track behavior over time
4. **A/B Testing:** Add experiment tracking for feature tests
5. **External Tool:** Integrate with PostHog, Mixpanel, or Amplitude for advanced features

## Files Modified

- ✅ `src/services/analyticsService.ts` (new)
- ✅ `supabase/migrations/20250119000001_create_analytics_events.sql` (new)
- ✅ `src/hooks/useAuth.tsx` - Added signup tracking
- ✅ `src/screens/main/HomeScreen.tsx` - Added game/win tracking
- ✅ `src/components/modals/EarnRewardModal.tsx` - Added referral tracking

## Testing

After running the migration:

1. Sign up a new user → Check `analytics_events` table for `user_signup` event
2. Play first game → Check for `first_game_played` event
3. Win a game → Check for `first_win` event
4. Share referral code → Check for `referral_shared` event

Query to view recent events:
```sql
SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 20;
```
