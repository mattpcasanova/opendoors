# Archived Migrations

This folder contains migrations that have been archived because they were:
- Temporary debug/diagnostic migrations
- One-time data fixes
- Superseded by later migrations
- Individual data updates that don't need to be reapplied

## Archived Files

### Debug/Diagnostic Migrations
These were used to debug RLS and signup issues during development:
- `20241220000004_temporary_rls_disable.sql` - Temporary RLS bypass (superseded)
- `20241220000005_force_rls_fix.sql` - Debug attempt (superseded)
- `20241220000006_bypass_rls.sql` - Debug attempt (superseded)
- `20241220000008_fix_all_rls.sql` - Debug attempt (superseded)
- `20241221000009_test_rls_policies.sql` - Test migration (not needed in production)
- `20241224000002_diagnose_signup_issue.sql` - Diagnostic migration (resolved)
- `check_and_fix_rls_policies.sql` - One-time check (resolved)

### Data Fix Migrations
One-time fixes for specific issues:
- `20241224000003_fix_orphaned_accounts.sql` - Fixed orphaned accounts (one-time fix)
- `20241224000004_delete_specific_accounts.sql` - Deleted test accounts (one-time fix)
- `set_all_existing_users_to_user_type.sql` - Set user types for existing users (one-time fix)

### Logo Update Migrations
Individual prize logo updates (consolidated into bulk updates later):
- `20240713000003_update_company_logos.sql`
- `20240713000004_update_starbucks_logo.sql`
- `20240713000005_update_specific_prize_logo.sql`
- `20240713000006_update_mcdonalds_prize_logo.sql`

## Note
These files are kept for reference but should NOT be applied to new databases.
The current schema includes all necessary changes from the active migrations.
