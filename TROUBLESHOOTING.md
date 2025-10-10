# 🔧 OpenDoors Troubleshooting Guide

## Network Connection Issues

### Symptoms:
- `[TypeError: Network request failed]` errors
- App shows loading screen indefinitely
- "Connection failed" messages

### Quick Fixes:

#### 1. **Restart Development Server**
```bash
# Stop current server (Ctrl+C)
npx expo start --clear
```

#### 2. **Check Environment Variables**
```bash
# Run the setup script
node scripts/setup-env.js
```

#### 3. **Verify Supabase Project Status**
- Go to your Supabase dashboard
- Check if your project is active
- Verify your API keys are correct

#### 4. **Test Connection**
The app now includes a connection status indicator at the top of the Home screen:
- ✅ Green = Connected
- ❌ Red = Connection failed (tap to retry)
- 🔄 Yellow = Checking connection

### Advanced Troubleshooting:

#### Check Your .env File
Make sure your `.env` file contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Network Issues
- Try switching between WiFi and mobile data
- Check if your network blocks certain ports
- Try using a VPN if you're on a restricted network

#### Supabase Issues
- Check Supabase status page: https://status.supabase.com
- Verify your project hasn't been paused due to inactivity
- Check if you've exceeded any rate limits

## App State Issues

### Symptoms:
- App crashes on startup
- Blank screens
- Navigation not working

### Fixes:

#### 1. **Clear App Data**
```bash
# For iOS Simulator
npx expo run:ios --clear

# For Android
npx expo run:android --clear
```

#### 2. **Reset Metro Cache**
```bash
npx expo start --clear --reset-cache
```

#### 3. **Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

## Database Issues

### Symptoms:
- "Profile not found" errors
- RLS policy errors
- Data not loading

### Fixes:

#### 1. **Check RLS Policies**
Run this SQL in your Supabase SQL editor:
```sql
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, using_clause, with_check_clause
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

#### 2. **Reset RLS Policies**
If needed, run the RLS fix script:
```sql
-- Run the contents of supabase/migrations/check_and_fix_rls_policies.sql
```

#### 3. **Check User Data**
```sql
-- Verify your user exists
SELECT id, email, user_type, organization_id 
FROM user_profiles 
WHERE email = 'your-email@example.com';
```

## Development Issues

### Common Problems:

#### 1. **TypeScript Errors**
```bash
# Clear TypeScript cache
npx tsc --build --clean
```

#### 2. **Metro Bundler Issues**
```bash
# Reset Metro completely
npx expo start --clear --reset-cache --no-dev --minify
```

#### 3. **Expo Go Issues**
- Make sure you're using the latest version of Expo Go
- Try creating a development build instead
- Check if your project uses any native modules not supported in Expo Go

## Getting Help

### Debug Information to Collect:
1. **Console Logs**: Copy all console output when the error occurs
2. **Network Status**: Check the connection status indicator
3. **Environment**: iOS/Android, Expo Go/Development Build
4. **Steps to Reproduce**: What were you doing when the error occurred?

### Useful Commands:
```bash
# Check app logs
npx expo logs

# Check Metro bundler logs
npx expo start --verbose

# Test Supabase connection
node -e "console.log('Testing...'); require('./src/services/supabase/client.ts')"
```

### Contact:
If issues persist, provide:
- Complete error logs
- Screenshots of the connection status
- Your Supabase project URL (without the key)
- Steps to reproduce the issue
