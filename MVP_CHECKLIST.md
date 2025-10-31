# 🚀 OpenDoors MVP Pre-Launch Checklist

This checklist covers all critical items before launching your Minimum Viable Product.

## 📊 Status Legend
- ❌ **NOT DONE** - Code is missing/incomplete, needs to be implemented
- ✅ **DONE** - Code exists and should work (may need testing/verification)
- ⚠️ **PARTIAL/NEEDS DECISION** - Partially done or needs your decision on approach
- 🟡 **VERIFY** - Code exists but needs testing to confirm it works

## 🎯 Quick Answer to "What's Actually NOT Done?"

**Truly Missing (Must Fix):**
1. ~Game data tracking - values exist but not passed through callback~ → ✅ Implemented
2. ~Referral link URLs - placeholder `[APP_STORE_LINK]` needs real URLs~ → ✅ Implemented (config-driven `referralUrl`)

**Needs Your Decision:**
1. RLS bypass - intentionally disabled "for MVP" - is this acceptable?
2. Ad SDK - currently simulated - keep for MVP or integrate real ads?

**Partially Done:**
1. Push notifications - in-app notifications work, but actual push sending not implemented

**Everything Else:** Code exists, needs testing/verification

---

## 🔴 **CRITICAL - Must Fix Before Launch**

### Code Completeness (Actually Missing)
- [x] **Pass Actual Game Data Through Callback** 
  - [x] Update `GameScreen.tsx` `onGameComplete` callback signature to include:
    - `chosen_door` (available as `selectedDoor` state)
    - `winning_door` (available as `prizeLocation` state)
    - `revealed_door` (available as `revealedDoors[0]` state, or first revealed door)
    - `game_duration_seconds` (timer from game start)
  - [x] Update `HomeScreen.tsx` `handleGameComplete` to receive and use these values
  - [x] Remove placeholder values
  - **Status:** ✅ DONE
  - **Impact:** Accurate analytics and game statistics

### Referral System ✅ COMPLETE (Needs Testing)
- [x] **Database Schema** (`supabase/migrations/20241222000000_create_referrals_table.sql`)
  - [x] Created `referrals` table with tracking fields
  - [x] Added `referral_code` and `referred_by_id` to `user_profiles`
  - [x] RLS policies configured
  - **Status:** ✅ DONE - Migration ready to run
  - **Note:** Run migration: `supabase/migrations/20241222000000_create_referrals_table.sql`

- [x] **Referral Service** (`src/services/referralService.ts`)
  - [x] Generates unique referral codes for each user
  - [x] Creates referral relationships on signup
  - [x] Checks first game and grants rewards to both parties
  - [x] Sends notifications to both referrer and referred user
  - **Status:** ✅ COMPLETE

- [x] **Deep Linking** (`src/hooks/useReferralLink.ts`)
  - [x] Captures referral codes from URLs (`?ref=CODE`)
  - [x] Supports both `https://opendoors.app/download?ref=CODE` and `opendoors://?ref=CODE`
  - [x] Stores code temporarily until signup
  - **Status:** ✅ COMPLETE (may need testing for deep link handling)

- [x] **Share URL with Referral Code** (`src/components/modals/EarnRewardModal.tsx`)
  - [x] Includes referral code in share URL
  - [x] Placeholder website URL works (`https://opendoors.app/download`)
  - [x] Can be updated to real website URL later via `EXPO_PUBLIC_REFERRAL_URL`
  - **Status:** ✅ COMPLETE

- [x] **Signup Integration** (`src/screens/auth/SignupScreen.tsx`, `src/services/auth.ts`)
  - [x] Captures referral code from deep link on signup
  - [x] Creates referral relationship in database
  - **Status:** ✅ COMPLETE

- [x] **Game Completion Check** (`src/screens/main/HomeScreen.tsx`)
  - [x] Checks if user's first game after signup
  - [x] Grants rewards to both referrer and referred user
  - [x] Sends notifications to both users
  - **Status:** ✅ COMPLETE

- [ ] **Testing Required:**
  - [ ] Verify deep link capture (open `opendoors://?ref=TESTCODE` and check logs)
  - [ ] Test full flow: Share link → Friend signs up → Friend plays first game → Both get rewards
  - [ ] Verify notifications appear for both users
  - [ ] Check database `referrals` table after full flow
  - [ ] Test edge cases: self-referral (should be blocked), invalid codes, duplicate referrals
  - **Status:** ⚠️ NEEDS TESTING - Code complete, functionality needs verification

- **Overall Status:** ✅ CODE COMPLETE - Ready for testing
- **Impact:** Full referral system implemented - both referrer and referred user get +1 door when referred user plays first game

### Database Security (Decision: Implement RLS Now)
- [x] **Decision:** Implement proper RLS policies before MVP launch
- [x] Enable RLS on critical tables
  - [x] `door_distributions`
  - [x] `earned_rewards`
  - [x] `door_notifications`
- [x] Add SECURITY DEFINER functions (privileged inserts only)
  - [x] `create_door_distribution(distributor_id, recipient_id, organization_id, doors_to_send, reason)`
  - [x] `add_earned_reward(user_id, source_type, source_name, description, doors_earned)`
  - [x] `create_door_notification(user_id, distributor_name, doors_sent, reason)`
- [x] Lock down direct INSERTS (INSERT policies with `WITH CHECK (false)`); allow owner SELECT/UPDATE
- [x] Update app to call RPCs instead of direct inserts
  - [x] Use `supabase.rpc('create_door_distribution', ...)`
  - [x] Use `supabase.rpc('add_earned_reward', ...)`
  - [x] Use `supabase.rpc('create_door_notification', ...)`
- [x] Test policies across roles (user, distributor, admin)
  - [x] Positive tests (authorized actions succeed)
  - [x] Negative tests (unauthorized actions blocked)
  - Run: `supabase/migrations/20241221000009_test_rls_policies.sql` (replace placeholder UUIDs)
  - Result: If script completes without error → policies are correct

---

## 🟠 **HIGH PRIORITY - Should Fix Before Launch**

### Ad Integration ✅ COMPLETE
- [x] **Ad SDK Integration** (`src/services/adsService.ts`, `src/screens/main/HomeScreen.tsx`, `src/screens/rewards/EarnedRewardsScreen.tsx`)
  - [x] **Done:** Google AdMob SDK integrated with rewarded ads
  - [x] **Done:** Test App IDs configured in `app.json` (iOS: `ca-app-pub-3940256099942544~1458002511`, Android: `ca-app-pub-3940256099942544~3347511713`)
  - [x] **Done:** Rewarded ad flow implemented (load → show → grant reward)
  - [x] **Done:** Integrated in HomeScreen and EarnedRewardsScreen
  - [ ] **Before First Production Build:** Set up AdMob account and get real App IDs + Rewarded Ad Unit IDs
  - [ ] **Before First Production Build:** Replace test App IDs in `app.json` with real AdMob App IDs
  - [ ] **Before First Production Build:** Add real Rewarded Ad Unit IDs via `expo.extra.admob.rewardedUnitIds` or update `adsService.ts`
  - [ ] **Optional:** Add consent/ATT handling for GDPR/CCPA compliance
  - **Status:** ✅ COMPLETE (Test Mode) - Ready for production IDs
  - **Impact:** Ads working with test IDs; ready to monetize once production AdMob account is set up
  - **Note:** You can get AdMob App IDs BEFORE launch (just register your bundle ID/package name in AdMob console). Include them in your first production build to avoid needing an update later.

### Push Notifications & Automatic Notifications ✅ COMPLETE (Test Mode)
- [x] **Notification System Setup**
  - [x] Notification permissions flow implemented (`ProfileScreen.tsx`)
  - [x] Push notification service implemented (`pushNotificationService.ts`) using `expo-notifications`
  - [x] Push token registration on app startup and when permissions granted
  - [x] Local push notifications working (using `scheduleNotificationAsync` for testing)
  - [x] Database notifications system (`notificationService.ts`)
  - [x] In-app notification popups (`DoorNotification.tsx`, `BonusPlayNotification.tsx`, `EarnedRewardNotification.tsx`)

- [x] **Automatic Notification Triggers**
  - [x] Daily reset notification - Push notification when new play available (no popup, button is sufficient)
  - [x] Doors received - Notification popup + push when distributor sends doors
  - [x] Rewards expiring soon - Notification 2 days before expiration ("expiring soon")
  - [x] Rewards expiring tomorrow - Notification 1 day before expiration ("expiring tomorrow")
  - [x] Bonus play available - Dedicated popup when first earned (separate from general notifications)
  - [x] Earned reward from ad - Popup immediately after watching ad successfully

- [x] **Notification Persistence & Deduplication**
  - [x] Notifications only show once per event (database tracking in `user_settings`)
  - [x] Daily notifications tracked via `last_daily_notification_date`
  - [x] Expiring notifications tracked via `last_expiring_soon_date` and `last_expiring_tomorrow_date`
  - [x] Bonus notifications tracked via `last_bonus_notification_date`
  - [x] Bonus notifications filtered from general door notification popup (only show in dedicated bonus popup)
  - [x] Notifications marked as read when user dismisses popup (prevents re-showing on refresh)

- [ ] **Production Push Notification Setup** (Before Launch)
  - [ ] Store push tokens in database for server-side notification sending
  - [ ] Set up backend service (Supabase Edge Function or own server) to send push notifications
  - [ ] Replace local notifications with actual Expo Push Notification API calls from backend
  - [ ] Update `ios/OpenDoors/OpenDoors.entitlements` for production (`aps-environment: production`)
  - [ ] Implement deep linking for notification taps
  - **Status:** ✅ COMPLETE (Local/Test Mode) - Ready for production push service integration
  - **Impact:** Notifications work locally for testing; needs backend integration for production push notifications
  - **Note:** Current implementation uses local notifications which work on simulator/device but require backend for true push notifications when app is closed

### Error Handling & Edge Cases (Needs Testing)
- [ ] **Network Failure Handling** - Code exists, needs testing
  - [ ] Test behavior when device goes offline
  - [ ] Verify retry logic (`src/utils/supabaseHelpers.ts`) works correctly  
  - [ ] Test connection status indicator (`src/components/ConnectionStatus.tsx`)
  - [ ] Verify loading states exist for all async operations
  - **Status:** ✅ CODE EXISTS - Needs verification via testing

- [ ] **Geolocation Edge Cases** - Code exists, needs testing
  - [ ] Test behavior when location permission is denied
  - [ ] Test behavior when location services are disabled
  - [ ] Test behavior when user is out of range (no nearby games)
  - [ ] Test geocoding failures (invalid addresses)
  - **Status:** ✅ CODE EXISTS - Needs verification via testing
  - **Files:** `src/utils/distance.ts`, `src/hooks/useLocation.ts`

### Data Validation (Needs Verification)
- [ ] **Input Validation** - Likely exists, needs verification
  - [ ] Verify all user inputs are validated (signup, login, profile)
  - [ ] Test form submission with invalid data
  - [ ] Verify error messages are user-friendly
  - **Status:** ✅ LIKELY EXISTS - Needs verification via testing

- [ ] **Database Constraints** - Needs verification
  - [ ] Verify all database constraints are working (foreign keys, check constraints)
  - [ ] Test edge cases (e.g., user deletes account, prize expires mid-game)
  - **Status:** ⚠️ NEEDS VERIFICATION - Should be in place but needs testing

---

## 🟡 **MEDIUM PRIORITY - Nice to Have**

### Testing & QA
- [ ] **Manual Testing Checklist**
  - [ ] Test complete user journey: Sign up → Survey → Tutorial → Play game → Win reward → Claim reward
  - [ ] Test all filter combinations (category, distance, sort)
  - [ ] Test favorites functionality
  - [ ] Test daily play reset (verify it resets at correct time)
  - [ ] Test earned rewards flow (watch ad, refer friend, distributor doors)
  - [ ] Test organization features (if applicable for MVP)
  - [ ] Test on both iOS and Android
  - [ ] Test on different screen sizes

- [ ] **Load Testing**
  - [ ] Test with multiple simultaneous users
  - [ ] Test database performance with large datasets
  - [ ] Monitor Supabase API usage and rate limits

### Performance Optimization
- [ ] **Image Optimization**
  - [ ] Verify all prize logos load efficiently
  - [ ] Implement lazy loading for game cards
  - [ ] Add image caching

- [ ] **Query Optimization**
  - [ ] Review all database queries for efficiency
  - [ ] Add database indexes where needed
  - [ ] Optimize `active_games` view performance
  - [ ] Review distance calculation performance (geocoding can be slow)

### User Experience
- [ ] **Onboarding Flow**
  - [ ] Test tutorial overlay shows correctly for new users
  - [ ] Test survey screen doesn't flash (already fixed, but verify)
  - [ ] Verify skip tutorial works correctly

- [ ] **Empty States**
  - [ ] Add empty states for:
    - No games available
    - No rewards earned
    - No game history
    - No favorites
  - **Note:** Some may already exist, verify all scenarios

### Analytics & Monitoring
- [ ] **Analytics Setup**
  - [ ] Set up analytics (e.g., Mixpanel, Amplitude, or Firebase Analytics)
  - [ ] Track key events: game plays, wins, rewards claimed, referrals
  - [ ] Set up error tracking (e.g., Sentry, Bugsnag)

- [ ] **Logging**
  - [ ] Remove all debug console.logs before production
  - [ ] Keep critical error logging
  - [ ] Set up structured logging for production

---

## 🟢 **LOW PRIORITY - Post-MVP**

### Documentation
- [ ] **User Documentation**
  - [ ] Create in-app help/FAQ section
  - [ ] Document how to claim rewards at businesses

- [ ] **Developer Documentation**
  - [ ] Complete README.md with setup instructions
  - [ ] Document API endpoints
  - [ ] Document database schema
  - [ ] Add code comments for complex logic

### Features
- [ ] **QR Code Validation**
  - [ ] Implement backend validation when businesses scan QR codes
  - [ ] Add fraud prevention (prevent duplicate scans)

- [ ] **Premium Features** (if applicable)
  - [ ] Subscription flow (`src/screens/premium/SubscriptionScreen.tsx`)
  - [ ] Payment method management (`src/screens/premium/PaymentMethodScreen.tsx`)
  - [ ] Verify subscription status checks

### Polish
- [ ] **UI/UX Polish**
  - [ ] Add loading skeletons instead of spinners
  - [ ] Add haptic feedback for important actions
  - [ ] Smooth animations for state transitions
  - [ ] Consistent error messages across app

- [ ] **Accessibility**
  - [ ] Add accessibility labels to all interactive elements
  - [ ] Test with screen readers
  - [ ] Verify color contrast meets WCAG standards

---

## 🏗️ **DEPLOYMENT CHECKLIST**

### Pre-Build
- [ ] **Environment Variables**
  - [ ] Verify `.env` file has production Supabase credentials
  - [ ] Remove any test/staging credentials
  - [ ] Verify `app.config.ts` has correct configuration
  - [ ] Set up environment variables in EAS (for Expo Application Services)

- [ ] **Database Migrations**
  - [ ] Run all migrations in production database
  - [ ] Verify `active_games` view is correct
  - [ ] Test RLS policies in production
  - [ ] Backup production database before migration

- [ ] **Supabase Configuration**
  - [ ] Verify Supabase Edge Function for QR code generation is deployed
  - [ ] Test QR code generation works in production
  - [ ] Verify storage buckets have correct permissions
  - [ ] Set up Supabase storage for QR codes

### Build Configuration
- [ ] **App Icons & Assets**
  - [ ] Verify app icon exists for all sizes (iOS and Android)
  - [ ] Verify splash screen assets
  - [ ] Add app store screenshots (if submitting to stores)

- [ ] **App Metadata**
  - [ ] Update `app.json` with correct app name, version, description
  - [ ] Verify bundle identifiers (iOS) and package names (Android)
  - [ ] Update version numbers (follow semver)

- [ ] **EAS Build**
  - [ ] Test EAS build locally (`eas build --profile preview`)
  - [ ] Verify `eas.json` configuration is correct
  - [ ] Create production build profiles if needed

### App Store Submission (iOS)
- [ ] **App Store Connect**
  - [ ] Create app listing in App Store Connect
  - [ ] Fill out app description, keywords, screenshots
  - [ ] Set up App Store categories
  - [ ] Prepare privacy policy URL (or create one)
  - [ ] Prepare support URL

- [ ] **Certificates & Provisioning**
  - [ ] Verify Apple Developer account is active
  - [ ] Generate production certificates
  - [ ] Update bundle identifier matches App Store Connect

### Google Play Submission (Android)
- [ ] **Google Play Console**
  - [ ] Create app listing in Google Play Console
  - [ ] Fill out app description, screenshots, feature graphic
  - [ ] Prepare privacy policy URL
  - [ ] Set up content rating
  - [ ] Prepare support email

- [ ] **Signing**
  - [ ] Generate upload keystore (or use EAS managed)
  - [ ] Verify signing configuration in `android/app/build.gradle`

### Post-Deployment
- [ ] **Monitoring**
  - [ ] Set up production error monitoring
  - [ ] Monitor Supabase usage and costs
  - [ ] Set up alerts for critical errors
  - [ ] Monitor app performance (crash rate, ANR rate)

- [ ] **Analytics**
  - [ ] Verify analytics events are firing correctly
  - [ ] Set up conversion tracking
  - [ ] Monitor user acquisition channels

---

## 📋 **PRIORITY SUMMARY**

### **Must Fix (Actually Missing/Not Done):**
1. ✅ **Track actual game data** - DONE
2. ✅ **Replace referral link placeholders** - DONE

### **Need Decision:**
3. ⚠️ **RLS policies** - Currently bypassed by design ("for MVP"), evaluate if acceptable for launch

### **Should Verify/Test:**
1. ⚠️ **Push notifications** - In-app works, but actual push sending not implemented
2. ✅ **Error handling** - Code exists, needs testing
3. ✅ **Edge cases** - Code exists, needs testing

### **Need Decision:**
4. ⚠️ **Ad SDK** - Currently simulated, functional but not monetized (acceptable for MVP?)

### **Nice to Have:**
1. Comprehensive testing
2. Performance optimization
3. Analytics setup
4. Remove debug logs

### **Deployment:**
1. Environment setup
2. Database migrations
3. Build configuration
4. App store metadata

---

## 📝 **NOTES**

- **Referral Links:** Now uses config-driven `referralUrl` with fallback to `https://opendoors.app/download`.

- **Ad Integration:** The simulated ad watch is functional for MVP, but you'll want real ads eventually for monetization.

- **RLS:** Implementing now: enable RLS on critical tables, add SECURITY DEFINER functions, and use RPCs for privileged inserts.

- **Game Tracking:** Game data values now flow from `GameScreen` to `HomeScreen` and into `recordGame`.

---

**Last Updated:** Generated based on current codebase state
**Recommended Timeline:** Address Critical items first (1-2 days), then High Priority (2-3 days), then Medium/Low as time permits before launch.

