# OpenDoors Database Schema

## Overview
This document describes the Supabase PostgreSQL database schema for OpenDoors.

## Core Tables

### `user_profiles`
**Purpose:** Extended user profile information beyond Supabase auth
**Inherits from:** `auth.users` (via trigger)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | User's email |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| phone | TEXT | Optional phone number |
| birth_date | DATE | Birth date (for age verification & birthday rewards) |
| user_type | TEXT | 'user', 'distributor', or 'admin' |
| organization_id | UUID | References organizations (for distributors) |
| status | TEXT | 'active', 'pending_confirmation', 'suspended' |
| total_games | INTEGER | Total games played |
| total_wins | INTEGER | Total games won |
| daily_plays_remaining | INTEGER | Plays remaining today (resets daily) |
| subscription_status | TEXT | 'free', 'premium', 'enterprise' |
| referral_code | TEXT | Unique referral code for sharing |
| referred_by_id | UUID | References user who referred this user |
| doors_available | INTEGER | Available doors for distributors |
| doors_distributed | INTEGER | Total doors sent by distributors |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Triggers:**
- `handle_new_user()` - Automatically creates profile when auth.users record is created

---

### `prizes`
**Purpose:** Available prizes/games that users can play

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Prize name (e.g., "Free Coffee at Starbucks") |
| description | TEXT | Prize description |
| category | TEXT | 'Food', 'Drinks', 'Activities', etc. |
| location_name | TEXT | Business name |
| address | TEXT | Business address |
| logo_url | TEXT | URL to business logo |
| doors | INTEGER | Number of doors in the game (default: 3) |
| is_active | BOOLEAN | Whether prize is currently available |
| is_special | BOOLEAN | Whether prize is featured/special |
| created_at | TIMESTAMPTZ | When prize was added |
| updated_at | TIMESTAMPTZ | Last update |

**Indexes:**
- `idx_prizes_category` on category
- `idx_prizes_is_active` on is_active

**Views:**
- `active_games` - Filters to only active prizes for display

---

### `game_history`
**Purpose:** Records of all games played

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Player (references user_profiles) |
| prize_id | UUID | Prize played for (references prizes) |
| won | BOOLEAN | Whether user won |
| switched | BOOLEAN | Whether user switched doors |
| chosen_door | INTEGER | Final door selected |
| winning_door | INTEGER | Door with the prize |
| revealed_door | INTEGER | Door revealed during game |
| game_duration_seconds | INTEGER | How long game took |
| created_at | TIMESTAMPTZ | When game was played |

**Indexes:**
- `idx_game_history_user_id` on user_id
- `idx_game_history_created_at` on created_at DESC

---

### `user_rewards`
**Purpose:** Won prizes awaiting redemption

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Winner (references user_profiles) |
| prize_id | UUID | Prize won (references prizes) |
| game_id | UUID | Game that won it (references game_history) |
| qr_code_url | TEXT | QR code for redemption |
| status | TEXT | 'unclaimed', 'claimed', 'expired' |
| claimed_at | TIMESTAMPTZ | When reward was redeemed |
| expires_at | TIMESTAMPTZ | Expiration date |
| created_at | TIMESTAMPTZ | When reward was won |

**Indexes:**
- `idx_user_rewards_user_id` on user_id
- `idx_user_rewards_status` on status

---

### `referrals`
**Purpose:** Tracks referral relationships and rewards

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| referrer_id | UUID | User who shared code |
| referred_id | UUID | User who signed up with code |
| status | TEXT | 'pending', 'completed' |
| reward_granted_at | TIMESTAMPTZ | When both users got rewards |
| created_at | TIMESTAMPTZ | When referral was created |

**Business Logic:**
- Both users get +1 door when referred user plays their first game
- Prevents self-referrals

---

### `earned_rewards`
**Purpose:** Extra doors earned through ads, referrals, or distributor gifts

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Recipient (references user_profiles) |
| source_type | TEXT | 'ad', 'referral', 'distributor' |
| source_name | TEXT | Description of source |
| doors_earned | INTEGER | Number of doors earned |
| is_claimed | BOOLEAN | Whether door has been used |
| claimed_at | TIMESTAMPTZ | When door was used |
| created_at | TIMESTAMPTZ | When door was earned |

---

### `door_distributions`
**Purpose:** Track distributor door gifts to users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| distributor_id | UUID | Who sent doors |
| recipient_id | UUID | Who received doors |
| organization_id | UUID | Distributor's organization |
| doors_sent | INTEGER | Number of doors sent |
| reason | TEXT | Why doors were sent |
| created_at | TIMESTAMPTZ | When doors were sent |

**RLS:** Uses `create_door_distribution()` function for secure inserts

---

### `door_notifications`
**Purpose:** In-app notifications for received doors

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Recipient |
| distributor_name | TEXT | Name of sender |
| doors_sent | INTEGER | Number of doors |
| reason | TEXT | Message/reason |
| is_read | BOOLEAN | Whether user has seen it |
| created_at | TIMESTAMPTZ | When notification was created |

**Features:**
- Realtime subscriptions enabled for live updates
- Auto-deleted after read (configurable)

---

### `analytics_events`
**Purpose:** Track key user events for analytics

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who triggered event |
| event_name | TEXT | Event type (e.g., 'user_signup', 'first_game_played') |
| event_data | JSONB | Additional event metadata |
| created_at | TIMESTAMPTZ | When event occurred |

**Tracked Events:**
- `user_signup` - New user registration
- `first_game_played` - User's first game
- `first_win` - User's first win
- `game_played` - Any game played
- `referral_shared` - User shared referral code
- `ad_watched` - User watched rewarded ad
- `daily_return` - User opened app on different day

**Indexes:**
- `idx_analytics_events_user_id` on user_id
- `idx_analytics_events_event_name` on event_name
- `idx_analytics_events_created_at` on created_at DESC
- `idx_analytics_events_user_event` on (user_id, event_name)

---

### `user_preferences`
**Purpose:** User's favorite prize categories

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User (references user_profiles) |
| category | TEXT | Preferred category |
| created_at | TIMESTAMPTZ | When preference was set |

---

### `user_settings`
**Purpose:** User app settings and permissions

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Primary key, references user_profiles |
| location_enabled | BOOLEAN | Location permission granted |
| notifications_enabled | BOOLEAN | Notification permission granted |
| survey_completed | BOOLEAN | Has completed onboarding survey |
| tutorial_completed | BOOLEAN | Has completed tutorial |
| distance_filter | TEXT | Distance filter preference ('Any', '5 miles', etc.) |
| sort_by | TEXT | Sort preference ('Closest', 'Newest', etc.) |
| excluded_categories | TEXT[] | Categories to hide |
| show_only_favorites | BOOLEAN | Filter to only favorite categories |
| last_daily_notification_date | DATE | Last daily reset notification |
| last_expiring_soon_date | DATE | Last "expiring soon" notification |
| last_expiring_tomorrow_date | DATE | Last "expiring tomorrow" notification |
| last_bonus_notification_date | DATE | Last bonus door notification |
| created_at | TIMESTAMPTZ | Settings created |
| updated_at | TIMESTAMPTZ | Settings last updated |

---

### `organizations`
**Purpose:** Businesses that can distribute doors

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Organization name |
| logo_url | TEXT | Organization logo |
| doors_budget | INTEGER | Total doors allocated |
| created_at | TIMESTAMPTZ | When organization was created |

---

## Security (RLS)

### Row Level Security Status
All tables have RLS enabled. Key patterns:

**User Tables:**
- Users can SELECT/UPDATE their own records
- Authenticated users can INSERT their own records

**Sensitive Operations:**
- `door_distributions` - Use `create_door_distribution()` RPC function
- `earned_rewards` - Use `add_earned_reward()` RPC function
- `door_notifications` - Use `create_door_notification()` RPC function

### RPC Functions
- `create_door_distribution()` - SECURITY DEFINER for privileged door distribution
- `add_earned_reward()` - SECURITY DEFINER for earning doors
- `create_door_notification()` - SECURITY DEFINER for creating notifications
- `get_distributor_history()` - Get distribution history for distributors

---

## Migrations

### Active Migrations
See `supabase/migrations/` for all active migrations.

### Archived Migrations
Diagnostic, debug, and one-time fix migrations are in `supabase/migrations/archive/`.

---

## Common Queries

### Get User's Available Doors
```sql
SELECT
  daily_plays_remaining as daily_doors,
  (SELECT COUNT(*) FROM earned_rewards
   WHERE user_id = $1 AND is_claimed = false) as earned_doors
FROM user_profiles
WHERE id = $1;
```

### Get User's Win Rate
```sql
SELECT
  ROUND(100.0 * SUM(CASE WHEN won THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate
FROM game_history
WHERE user_id = $1;
```

### Get Active Games Near Location
```sql
SELECT * FROM active_games
WHERE is_active = true
ORDER BY created_at DESC;
```

---

## Indexes Summary

**Performance Indexes:**
- All foreign keys are indexed
- Timestamp columns for querying by date
- Status columns for filtering
- Category columns for grouping

**Composite Indexes:**
- (user_id, event_name) for analytics
- (user_id, is_claimed) for earned rewards

---

## Notes

- All timestamps are TIMESTAMPTZ (timezone-aware)
- All IDs are UUID v4 (via gen_random_uuid())
- Soft deletes not used - prefer ON DELETE CASCADE
- Birth dates stored for COPPA compliance and birthday rewards
- Analytics data retained indefinitely for long-term analysis

---

**Last Updated:** 2025-01-19
**Schema Version:** 1.0 (matches migrations as of today)
