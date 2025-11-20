# Environment Variables Documentation

## Overview
OpenDoors uses environment variables for configuration across development, staging, and production environments. This guide documents all required variables and how to configure them.

---

## Quick Reference

### Required Variables

| Variable | Required | Secret? | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Yes | ❌ No | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | ⚠️ Public | Supabase anonymous key (safe to expose) |
| `EXPO_PUBLIC_REFERRAL_URL` | ✅ Yes | ❌ No | Deep link URL for referral sharing |

### Optional Variables

| Variable | Required | Secret? | Description |
|----------|----------|---------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | ✅ YES | **NEVER** expose in app - server-side only |
| `EXPO_PUBLIC_API_URL` | ❌ No | ❌ No | Custom API endpoint (if not using Supabase directly) |

---

## Development Setup

### Step 1: Create `.env` File

Create a `.env` file in the project root (already in `.gitignore`):

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Referral Deep Link
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download

# DO NOT add SUPABASE_SERVICE_ROLE_KEY - server-side only!
```

### Step 2: Get Your Values

#### Supabase URL & Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → **DO NOT PUT IN `.env`** (server-side only)

#### Referral URL

Development:
```bash
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download
```

Production (same):
```bash
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download
```

---

## Production Configuration

### For EAS Builds

**Option 1: Use `eas.json` secrets (Recommended)**

```bash
# Set secrets in EAS (one-time setup)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project-id.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-anon-key
eas secret:create --scope project --name EXPO_PUBLIC_REFERRAL_URL --value https://opendoors.app/download
```

Then in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "$EXPO_PUBLIC_SUPABASE_URL",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$EXPO_PUBLIC_SUPABASE_ANON_KEY",
        "EXPO_PUBLIC_REFERRAL_URL": "$EXPO_PUBLIC_REFERRAL_URL"
      }
    }
  }
}
```

**Option 2: Use `.env.production` (Alternative)**

Create `.env.production` (add to `.gitignore`):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download
```

---

## Variable Details

### `EXPO_PUBLIC_SUPABASE_URL`

**Purpose**: Supabase project endpoint for database, auth, and storage

**Format**: `https://[project-id].supabase.co`

**Where to find**:
- Supabase Dashboard → Settings → API → Project URL

**Example**:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

**Security**: ✅ Safe to expose (public URL)

---

### `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Purpose**: Public anonymous key for client-side Supabase operations

**Format**: Long JWT token starting with `eyJ...`

**Where to find**:
- Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

**Example**:
```bash
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security**: ✅ Safe to expose (designed for client-side use, protected by RLS)

**Important**: This key is **meant** to be public. Your database is protected by Row Level Security (RLS) policies, not by hiding this key.

---

### `EXPO_PUBLIC_REFERRAL_URL`

**Purpose**: Base URL for deep linking when users share referral codes

**Format**: `https://[your-domain]/[path]`

**Current Value**:
```bash
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download
```

**Usage**: Used in `src/components/modals/EarnRewardModal.tsx` to generate shareable referral links:
```typescript
const referralUrl = `${process.env.EXPO_PUBLIC_REFERRAL_URL}?ref=${user.referral_code}`;
```

**Security**: ✅ Safe to expose (public URL)

**Note**: Requires associated domain configuration in:
- `app.json` → `scheme` (currently: `opendoors`)
- Apple Developer → Associated Domains (if using Universal Links)

---

### `SUPABASE_SERVICE_ROLE_KEY` ⚠️

**Purpose**: Server-side operations with **full database access**, bypassing RLS

**Format**: Long JWT token starting with `eyJ...`

**Where to find**:
- Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`

**Security**: 🚨 **NEVER** expose this key in:
- Client-side code
- `.env` file committed to git
- Mobile app bundle
- Browser/frontend

**Usage**: Only for:
- Backend API routes (if you add a server)
- Database migrations
- Admin scripts
- CI/CD automation

**Current Status**: ✅ **NOT** used in OpenDoors mobile app (all operations use RLS-protected anon key)

---

## How Environment Variables Are Used

### Development (Local)

1. Expo reads from `.env` file automatically
2. Variables prefixed with `EXPO_PUBLIC_` are bundled into app
3. Access in code:
   ```typescript
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
   ```

### Production (EAS Build)

1. EAS reads from:
   - EAS Secrets (recommended)
   - OR `.env.production` file
2. Variables are baked into the build at build-time
3. Same access pattern in code

### TestFlight/App Store

- Variables are **baked into the binary** at build time
- Cannot be changed without rebuilding
- Must use production values before building

---

## File Locations

### Environment Variables Are Used In:

#### `src/services/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### `src/components/modals/EarnRewardModal.tsx`
```typescript
const referralUrl = `${process.env.EXPO_PUBLIC_REFERRAL_URL}?ref=${user.referral_code}`;
```

#### `app.json`
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}
```

---

## Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use `EXPO_PUBLIC_` prefix for client-side variables
- Use EAS Secrets for production builds
- Rotate keys if accidentally committed to git
- Use different Supabase projects for dev/staging/production

### ❌ DON'T:
- Commit `.env` or `.env.production` to git
- Put `SUPABASE_SERVICE_ROLE_KEY` in mobile app
- Hardcode secrets in source code
- Share production keys in Slack/Discord/etc.

### 🔐 If You Accidentally Expose a Secret:

1. **Supabase Keys**:
   - Go to Supabase Dashboard → Settings → API
   - Click "Reset" next to the exposed key
   - Update your `.env` and EAS secrets

2. **AdMob Keys**:
   - Contact AdMob support to rotate
   - Update in `app.json`

3. **Git Commits**:
   - **DO NOT** just delete and commit again (key is still in git history)
   - Use `git filter-branch` or BFG Repo-Cleaner to purge history
   - OR easier: Rotate the key and move on

---

## Checking Your Configuration

### Development Check

```bash
# Start app
npm start

# Check console for Supabase connection
# Should see: ✓ Supabase client initialized
```

### Production Check

Before creating EAS build:

```bash
# List EAS secrets
eas secret:list

# Should show:
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
# - EXPO_PUBLIC_REFERRAL_URL
```

### Runtime Check

Add temporary logging in `App.tsx`:

```typescript
console.log('Env check:', {
  hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  hasReferralUrl: !!process.env.EXPO_PUBLIC_REFERRAL_URL,
});
```

---

## Multiple Environments (Future)

If you want separate dev/staging/production environments:

### Option 1: Separate Supabase Projects

```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key

# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

### Option 2: EAS Build Profiles

In `eas.json`:
```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://dev.supabase.co"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://prod.supabase.co"
      }
    }
  }
}
```

Then build with:
```bash
eas build --profile development
eas build --profile production
```

---

## Common Issues

### Issue: `Cannot read property 'EXPO_PUBLIC_SUPABASE_URL' of undefined`

**Cause**: Environment variables not loaded

**Fix**:
1. Ensure `.env` file exists in project root
2. Restart Metro bundler (`npm start`)
3. Clear cache: `npx expo start -c`

### Issue: Environment variables showing as `undefined` in production build

**Cause**: Variables not set in EAS or `.env.production`

**Fix**:
```bash
# Check EAS secrets
eas secret:list

# Add missing secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your-url
```

### Issue: Old environment values cached

**Cause**: Metro bundler cache

**Fix**:
```bash
# Clear all caches
rm -rf node_modules
npm install
npx expo start -c
```

### Issue: Different values in development vs production

**Cause**: Likely using different `.env` files or EAS secrets

**Fix**: Verify values match:
```bash
# Development
cat .env

# Production (EAS)
eas secret:list
```

---

## Migration Checklist

When moving from development to production:

- [ ] Verify Supabase production project is set up
- [ ] Copy production URL and anon key from Supabase Dashboard
- [ ] Add secrets to EAS or create `.env.production`
- [ ] Update `EXPO_PUBLIC_REFERRAL_URL` if domain changed
- [ ] Remove any test/debug environment variables
- [ ] Test connection in development with production credentials
- [ ] Create EAS production build
- [ ] Verify environment variables in TestFlight build
- [ ] Document any new environment variables added

---

## Reference Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **EAS Secrets Documentation**: https://docs.expo.dev/build-reference/variables/
- **Expo Environment Variables**: https://docs.expo.dev/guides/environment-variables/
- **AdMob Dashboard**: https://apps.admob.com

---

## Summary

### Current Production Values (for reference):

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Deep Links
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download
```

### Where They're Used:

- `EXPO_PUBLIC_SUPABASE_URL` → Database connection
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` → Auth & database queries (protected by RLS)
- `EXPO_PUBLIC_REFERRAL_URL` → Referral sharing

### Security Status:

✅ All current variables are safe to expose (client-side)
✅ No server-side secrets in mobile app
✅ Database protected by Row Level Security (RLS)
✅ `.env` files in `.gitignore`

---

**Last Updated**: 2025-01-19
