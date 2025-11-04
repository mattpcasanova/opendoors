# 🐛 Debug: "User Already Registered" for All Emails

## Issue
Getting "User already registered" error for **ANY** email address, even completely new ones.

## Possible Causes

### 1. **Database Trigger Failure**
The `handle_new_user()` trigger creates a profile automatically. If this fails, it could cause issues.

**Check:**
```sql
-- Check if trigger exists and is working
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check recent signup attempts
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if profiles exist for these users
SELECT u.id, u.email, p.id as profile_id
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;
```

### 2. **RLS Policy Blocking Trigger**
The trigger uses `SECURITY DEFINER`, but RLS on `user_profiles` might be blocking the insert.

**Check:**
```sql
-- Check RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';
```

### 3. **Missing Required Columns**
If `user_profiles` has NOT NULL columns that the trigger doesn't populate, the insert will fail.

**Check:**
```sql
-- Check user_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

### 4. **Supabase Auth Settings**
Check Supabase Dashboard → Authentication → Settings:
- Is "Enable email confirmations" ON or OFF?
- Are there any rate limits?
- Is "Disable new signups" enabled?

### 5. **Orphaned Accounts**
Previous signup attempts might have created accounts in `auth.users` but not in `user_profiles`.

**Check:**
```sql
-- Find orphaned accounts
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## Quick Fixes to Try

### Fix 1: Check Trigger Function
```sql
-- Test if trigger function works
SELECT handle_new_user();
```

### Fix 2: Temporarily Disable Email Confirmation
In Supabase Dashboard → Authentication → Settings:
- Turn OFF "Enable email confirmations" (if testing)
- This might be causing issues if email confirmation is required

### Fix 3: Check for Missing Columns
The trigger might be missing required columns added in later migrations.

**Check what columns trigger populates vs what's required:**
```sql
-- See trigger function
SELECT pg_get_functiondef('handle_new_user'::regproc);
```

### Fix 4: Manual Profile Creation Test
Try manually creating a profile to see what error you get:
```sql
-- Use a test UUID
INSERT INTO user_profiles (id, email, first_name, last_name, status, total_games, total_wins, daily_plays_remaining, subscription_status, user_type, doors_available, doors_distributed)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test',
  'User',
  'active',
  0,
  0,
  1,
  'free',
  'user',
  0,
  0
);
```

## Most Likely Cause

Based on the code, **most likely the trigger is failing** because:
1. `user_profiles` has required columns (like `user_type`, `doors_available`, `doors_distributed`) added in later migrations
2. The trigger function doesn't populate these columns
3. The INSERT fails, transaction rolls back
4. On retry, Supabase sees partial user and throws "already exists"

**Solution:** Update the trigger function to include all required columns.

