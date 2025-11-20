# 🚀 OpenDoors Pre-Launch Guide

## Overview
This guide contains everything you need to know for launching OpenDoors to production.

---

## ✅ Pre-Launch Checklist

### App Store Requirements
- [x] Apple Developer account approved
- [x] Bundle ID registered: `com.opendoors.app`
- [x] App created in App Store Connect
- [x] Privacy policy published: https://mattpcasanova.github.io/opendoors/privacy
- [x] Support page published: https://mattpcasanova.github.io/opendoors/support
- [x] App Privacy declarations completed
- [ ] Age rating completed (do during launch week)
- [ ] App categories set (Games > Casual)
- [ ] App Store screenshots (5 required)
- [ ] App Store metadata (description, keywords)

### Code & Build
- [x] Age verification implemented (13+)
- [x] Birth date field added to signup
- [x] Info.plist privacy strings updated
- [x] Analytics tracking integrated
- [x] AdMob iOS production IDs configured
- [ ] Console.logs cleaned (optional - Metro strips in production)
- [ ] Production environment variables set
- [ ] Production build created via EAS
- [ ] TestFlight testing completed

### Database
- [x] Birth date migration applied
- [x] Analytics events table created
- [x] RLS policies enabled
- [x] Referral system tested
- [x] Schema documented

### Testing
- [ ] Full user journey tested (signup → game → win)
- [ ] Age verification tested (block <13)
- [ ] Referral system tested end-to-end
- [ ] Physical device testing
- [ ] Error states tested (offline, no permission, etc.)

---

## 📋 Week-of-Launch Schedule

### Day 1-2: Testing
1. Test app builds successfully
2. Test referral system end-to-end
3. Test age verification
4. Test on physical iPhone
5. Test error states

### Day 3: App Store Prep
1. Take screenshots (5 required)
2. Complete age rating questionnaire
3. Set app categories
4. Finalize description/keywords
5. Double-check all URLs

### Day 4: Build & TestFlight
1. Set production environment variables
2. Create EAS production build
3. Upload to TestFlight
4. Test on TestFlight
5. Fix any issues

### Day 5: Submit
1. Final review of App Store Connect
2. Submit for App Store review
3. Monitor submission status

---

## 🔧 Production Build Process

### Step 1: Environment Variables
Ensure `.env` has production values:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_REFERRAL_URL=https://opendoors.app/download
```

### Step 2: Update Entitlements
Update `ios/OpenDoors/OpenDoors.entitlements`:
```xml
<key>aps-environment</key>
<string>production</string>
```

### Step 3: Build with EAS
```bash
# First time setup (if not done)
eas build:configure

# Create production build
eas build --platform ios --profile production

# Monitor build status
eas build:list
```

### Step 4: Download & Test
```bash
# Download IPA from EAS dashboard
# Upload to TestFlight via Transporter app
# OR use: eas submit --platform ios
```

### Step 5: TestFlight Testing
1. Install from TestFlight on physical device
2. Test complete user flow
3. Verify production features work:
   - Age verification
   - Location services
   - Referral sharing
   - Game play
   - AdMob ads

---

## 🎯 Critical Testing Scenarios

### Test 1: New User Signup
1. Delete app and reinstall
2. Sign up with birth date (age 13+)
3. Complete survey
4. Watch tutorial
5. Verify location permission requested
6. Verify notification permission requested

### Test 2: Age Verification
1. Try to sign up with birth date showing age <13
2. Should be blocked with clear message
3. Try to sign up with age 13+
4. Should succeed

### Test 3: Referral System
1. User A shares referral code
2. User B signs up with code
3. User B plays first game
4. Verify User A gets +1 door
5. Verify User B gets +1 door
6. Verify both get notifications

### Test 4: Game Flow
1. Play a game
2. Select door
3. See reveal animation
4. Win or lose
5. If win: get QR code
6. Verify game recorded in history

### Test 5: Error States
1. Turn off WiFi → verify graceful error
2. Deny location permission → verify app still works
3. Go offline mid-game → verify recovery

---

## 📱 App Store Screenshot Guide

### Required Sizes
- iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max, 16 Pro Max) - **REQUIRED**
- Dimensions: 1320 x 2868 pixels

### Screenshots to Take (5 minimum)
1. **Home Screen** - Show available games/prizes
   - Caption: "Discover Local Rewards Daily"

2. **Game Play** - Show door selection
   - Caption: "Pick a Door to Win"

3. **Win Screen** - Show QR code and prize
   - Caption: "Real Prizes You Can Use"

4. **Rewards Screen** - Show earned/claimable rewards
   - Caption: "Track Your Wins"

5. **Profile/Referral** - Show referral code sharing
   - Caption: "Refer Friends for Bonus Plays"

### How to Take
```bash
# Boot simulator
xcrun simctl boot "iPhone 16 Pro Max"
open -a Simulator

# Start app
npm run ios

# Take screenshots: Cmd + S (saves to Desktop)
```

---

## 🔐 Credentials & Access

### Apple Developer
- **Account:** Your Apple ID
- **Team ID:** (check developer.apple.com)
- **App ID:** com.opendoors.app
- **Bundle ID:** com.opendoors.app

### Supabase
- **Project:** (your project name)
- **URL:** https://your-project.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/your-project-id
- **Anon Key:** (in project settings → API)
- **Service Role Key:** (in project settings → API) - **DO NOT expose in app**

### AdMob
- **App ID (iOS):** ca-app-pub-5055120875750202~8739261688
- **Rewarded Ad Unit (iOS):** ca-app-pub-5055120875750202/9079717627
- **Dashboard:** https://apps.admob.com

### GitHub Pages
- **Privacy:** https://mattpcasanova.github.io/opendoors/privacy
- **Support:** https://mattpcasanova.github.io/opendoors/support
- **Repo:** https://github.com/mattpcasanova/opendoors

### Expo/EAS
- **Account:** (your Expo account)
- **Dashboard:** https://expo.dev
- **Project:** opendoors

---

## ⚠️ Common Issues & Solutions

### Issue: Build Fails
**Solution:**
```bash
# Clear caches
rm -rf node_modules
npm install
npx expo prebuild --clean
```

### Issue: Provisioning Profile Error
**Solution:**
- Use EAS managed credentials (easier)
- OR manually create in Apple Developer Portal

### Issue: App Crashes on Launch
**Solution:**
- Check production Supabase credentials
- Verify AdMob IDs are correct
- Check Xcode console for errors

### Issue: Location Permission Not Working
**Solution:**
- Verify Info.plist has `NSLocationWhenInUseUsageDescription`
- Check entitlements file
- Reset simulator/device location permissions

### Issue: Referrals Not Working
**Solution:**
- Check deep link URL scheme in app.json
- Verify referral code generation logic
- Check database for referral records

---

## 📊 Post-Launch Monitoring

### Day 1 After Launch
- [ ] Monitor crash reports in App Store Connect
- [ ] Check analytics for user signups
- [ ] Monitor Supabase usage/costs
- [ ] Test app from App Store (not TestFlight)

### Week 1 After Launch
- [ ] Review user feedback/ratings
- [ ] Check conversion metrics (signup → play)
- [ ] Monitor AdMob revenue
- [ ] Review analytics data

### Analytics Queries to Run
```sql
-- Total signups
SELECT COUNT(*) FROM analytics_events WHERE event_name = 'user_signup';

-- Conversion rate (signup → first game)
SELECT
  (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_name = 'first_game_played') * 100.0 /
  (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_name = 'user_signup') as conversion_rate;

-- Daily active users
SELECT DATE(created_at), COUNT(DISTINCT user_id)
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;
```

---

## 🎉 Launch Day Tasks

### Morning
1. ☕ Get coffee
2. Final app test on physical device
3. Check App Store Connect for approval
4. Monitor social media for launch posts

### If Approved
1. Celebrate! 🎉
2. Post on social media
3. Share with friends/family
4. Monitor initial downloads
5. Be ready to respond to user feedback

### If Rejected
1. Don't panic - very common
2. Read rejection reason carefully
3. Fix the issue
4. Resubmit
5. Average approval: 24-48 hours after resubmission

---

## 📞 Support Contacts

- **Apple Developer Support:** https://developer.apple.com/contact/
- **Supabase Support:** https://supabase.com/dashboard/support
- **Expo Support:** https://docs.expo.dev/get-started/support/
- **AdMob Support:** https://support.google.com/admob

---

## 🔄 Rollback Plan

If critical bugs found post-launch:

1. **Immediate:**
   - Don't panic
   - Identify the bug
   - Check if it's actually critical

2. **Quick Fix (if possible):**
   - Fix the bug
   - Create new build
   - Submit expedited review (if critical)

3. **Rollback (if needed):**
   - Can't rollback on App Store
   - Can only submit new version
   - Consider feature flags for future

---

**Good luck with your launch! 🚀**

*Last Updated: 2025-01-19*
