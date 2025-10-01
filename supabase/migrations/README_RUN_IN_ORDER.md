# 🗄️ SQL Migration Order

## ⚠️ IMPORTANT: Run these SQL files IN ORDER

### Step 1: Create Organizations System
**File:** `create_organizations_system.sql`

This creates:
- New tables (organizations, door_distributions, distributor_members)
- New columns in user_profiles
- RLS policies
- Indexes

**Run this first!**

---

### Step 2: Set All Existing Users to 'user' Type
**File:** `set_all_existing_users_to_user_type.sql`

This ensures:
- All existing user accounts are set to user_type = 'user'
- All have doors_available = 0
- All have doors_distributed = 0
- All have organization_id = NULL

**Run this second!**

---

### Step 3: Create Test Organization (Optional)
After running both SQL files above, you can create a test organization:

```sql
INSERT INTO organizations (name, description)
VALUES ('My Test Organization', 'Test organization for OpenDoors')
RETURNING id;
```

Copy the returned ID for next step.

---

### Step 4: Assign Test Roles (Optional)
Make specific accounts distributors or admins:

```sql
-- Make an account a distributor
UPDATE user_profiles 
SET user_type = 'distributor', 
    organization_id = '<YOUR_ORG_ID>',
    doors_available = 20
WHERE email = 'distributor@example.com';

-- Make an account an admin
UPDATE user_profiles 
SET user_type = 'admin', 
    organization_id = '<YOUR_ORG_ID>'
WHERE email = 'admin@example.com';

-- Add regular users to organization
UPDATE user_profiles 
SET organization_id = '<YOUR_ORG_ID>'
WHERE email IN ('user1@example.com', 'user2@example.com');
```

---

## 🔍 Verify Everything Worked

```sql
-- Check all user types
SELECT 
  email,
  user_type,
  organization_id,
  doors_available,
  doors_distributed
FROM user_profiles
ORDER BY user_type, email;
```

You should see:
- All users have `user_type` set (not NULL)
- Most/all are `'user'`
- `doors_available` and `doors_distributed` are 0 for regular users
- `organization_id` is NULL for users not in an org

---

## 🚨 If You Get Errors

### Error: "The result contains 0 rows" or "PGRST116"
- This is an RLS (Row Level Security) policy issue
- Run this SQL file: `check_and_fix_rls_policies.sql`
- This ensures users can read their own profile data

### Error: "column already exists"
- The columns were already added
- Skip to Step 2 and run `set_all_existing_users_to_user_type.sql`

### Error: "violates check constraint"
- Make sure you run Step 2 to set default values
- Check that user_type is one of: 'user', 'distributor', 'admin'

### Error: "relation does not exist"
- You need to run Step 1 first
- The tables need to be created before updating users

