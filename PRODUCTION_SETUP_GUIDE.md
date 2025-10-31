# 🚀 Production Setup Guide

This guide covers setting up Apple Developer, AdMob, and other production requirements.

## 📱 Apple Developer Account Setup

### When to Sign Up: **NOW** ✅

**Why sign up now:**
- ✅ Account approval can take 1-2 days (or longer)
- ✅ You need it to build for physical iOS devices
- ✅ Required for TestFlight (beta testing)
- ✅ Required for App Store submission
- ✅ You can sign up before having a complete app

**Steps:**
1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign up for Apple Developer Program ($99/year)
3. Wait for approval (usually 24-48 hours)
4. Once approved, add your bundle ID: `com.opendoors.app`
5. Generate App Store Connect API keys (if using EAS)

**What You'll Get:**
- Bundle ID registration
- Certificates for signing
- App Store Connect access
- TestFlight access

**Impact on Your Work:**
- No immediate code changes needed
- Can continue development while waiting for approval
- Will need account to build production iOS builds
- Update `ios/OpenDoors/OpenDoors.entitlements` after setup:
  ```xml
  <key>aps-environment</key>
  <string>production</string>
  ```

---

## 📺 Google AdMob Setup

### When to Sign Up: **NOW** ✅

**Why sign up now:**
- ✅ Can get App IDs and Ad Unit IDs before launch
- ✅ No app store listing required
- ✅ Just register your bundle ID/package name
- ✅ Takes ~24 hours for account approval
- ✅ Can integrate IDs into first production build (no update needed later)

**Steps:**
1. Go to [admob.google.com](https://admob.google.com)
2. Sign in with Google account (or create one)
3. Create AdMob account (free)
4. Add your app:
   - **iOS**: `com.opendoors.app` (bundle ID)
   - **Android**: Package name from `android/app/build.gradle` (usually `com.opendoors.app`)
5. Get your App IDs:
   - **iOS App ID**: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`
   - **Android App ID**: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`
6. Create Rewarded Ad Unit IDs:
   - Create new ad unit → Select "Rewarded"
   - Name it (e.g., "OpenDoors Rewarded iOS", "OpenDoors Rewarded Android")
   - Get the Ad Unit IDs:
     - **iOS Rewarded**: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`
     - **Android Rewarded**: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`

**What You'll Get:**
- iOS App ID: `ca-app-pub-...`
- Android App ID: `ca-app-pub-...`
- iOS Rewarded Ad Unit ID: `ca-app-pub-...`
- Android Rewarded Ad Unit ID: `ca-app-pub-...`

**Update Your Code:**

After getting IDs, update `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "iosAppId": "ca-app-pub-YOUR-REAL-IOS-APP-ID",
          "androidAppId": "ca-app-pub-YOUR-REAL-ANDROID-APP-ID"
        }
      ]
    ],
    "extra": {
      "admob": {
        "rewardedUnitIds": {
          "ios": "ca-app-pub-YOUR-REAL-IOS-REWARDED-ID",
          "android": "ca-app-pub-YOUR-REAL-ANDROID-REWARDED-ID"
        }
      }
    }
  }
}
```

**Note:** The `adsService.ts` already supports production IDs through `expoConfig.extra.admob.rewardedUnitIds`. Just add them to `app.json` as shown above. The service will automatically use production IDs when building for production.

**Timeline:**
- Sign up: Today
- Account approval: ~24 hours
- Get IDs: Immediately after approval
- Integrate IDs: Before first production build
- Start earning: When app goes live

---

## 🔐 Other Production Requirements

### Environment Variables
Before production build, ensure:
- [ ] `EXPO_PUBLIC_SUPABASE_URL` is set to production Supabase project
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` is production key
- [ ] `EXPO_PUBLIC_REFERRAL_URL` is your live website URL (or keep placeholder)
- [ ] No `.env` files committed to git

### Build Configuration
- [ ] Verify `app.json` bundle IDs match developer accounts
- [ ] Update version numbers (`version: "1.0.0"`)
- [ ] Set correct `scheme` (deep linking)
- [ ] Verify icons and splash screens

### App Store Assets (Can Do Later)
- [ ] App Store screenshots (required for submission)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Support email
- [ ] App Store listing metadata

---

## 📋 Pre-Launch Checklist

### Accounts Setup
- [ ] Apple Developer account created and approved
- [ ] AdMob account created and approved
- [ ] App IDs obtained from AdMob
- [ ] Ad Unit IDs created in AdMob

### Code Updates
- [ ] AdMob App IDs updated in `app.json`
- [ ] AdMob Ad Unit IDs updated in `adsService.ts`
- [ ] Production Supabase project configured
- [ ] Environment variables set for production

### Build & Test
- [ ] Production build created (`npx expo build` or EAS)
- [ ] Build tested on physical device
- [ ] Push notifications work in production build
- [ ] All features tested in production build

---

## ⏱️ Recommended Timeline

**Week 1 (Now):**
- Sign up for Apple Developer ($99)
- Sign up for AdMob (free)
- Wait for approvals (~24-48 hours)

**Week 2:**
- Get App IDs from AdMob
- Update code with production IDs
- Create production Supabase project (if needed)
- Set up production environment variables

**Week 3:**
- Create production builds
- Test on TestFlight (iOS) and internal testing (Android)
- Fix any production-specific issues

**Week 4:**
- Final testing
- Prepare App Store listings
- Submit for review

---

## 💰 Cost Summary

- **Apple Developer**: $99/year (one-time, recurring)
- **AdMob**: Free (Google takes % of ad revenue)
- **Supabase**: Free tier available (upgrade if needed)
- **EAS Build**: Free tier available (limited builds)

**Total Monthly (if using free tiers):** $0 (after Apple Developer annual fee)

---

## 🎯 Next Steps After Sign-Up

1. **Wait for approvals** (~24-48 hours)
2. **Get IDs from AdMob** (iOS App ID, Android App ID, Ad Unit IDs)
3. **Update `app.json`** with production App IDs
4. **Update `adsService.ts`** with production Ad Unit IDs
5. **Create production build** (EAS or `expo build`)
6. **Test on TestFlight** (iOS) or internal testing (Android)

---

**Last Updated:** After notification system completion
**Priority:** Sign up ASAP - approvals take time

