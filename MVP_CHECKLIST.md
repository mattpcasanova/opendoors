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

### Referral System (Actually Missing)
- [x] **Replace App Store Link Placeholder** (`src/components/modals/EarnRewardModal.tsx`)
  - [x] Use config-driven `referralUrl` from `app.config.ts` (`EXPO_PUBLIC_REFERRAL_URL`) with sensible default
  - **Status:** ✅ DONE
  - **Impact:** Referral shares now have a working URL

### Database Security (Decision: Implement RLS Now)
- [x] **Decision:** Implement proper RLS policies before MVP launch
- [ ] Enable RLS on critical tables
  - [ ] `door_distributions`
  - [ ] `earned_rewards`
  - [ ] `door_notifications`
- [ ] Add SECURITY DEFINER functions (privileged inserts only)
  - [ ] `create_door_distribution(distributor_id, recipient_id, doors_to_send, reason)`
  - [ ] `add_earned_reward(user_id, source_type, source_name, description, doors_earned)`
  - [ ] `create_door_notification(user_id, distributor_name, doors_sent, reason)`
- [ ] Lock down direct INSERTS (INSERT policies with `WITH CHECK (false)`); allow owner SELECT/UPDATE
- [ ] Update app to call RPCs instead of direct inserts
  - [ ] Use `supabase.rpc('create_door_distribution', ...)`
  - [ ] Use `supabase.rpc('add_earned_reward', ...)`
  - [ ] Use `supabase.rpc('create_door_notification', ...)`
- [ ] Test policies across roles (user, distributor, admin)
  - [ ] Positive tests (authorized actions succeed)
  - [ ] Negative tests (unauthorized actions blocked)

---

## 🟠 **HIGH PRIORITY - Should Fix Before Launch**

### Ad Integration (Needs Decision)
- [ ] **Ad SDK Integration Decision** (`src/components/modals/WatchAdModal.tsx`)
  - [ ] **Current:** Uses simulated 30-second countdown
  - [ ] **Option A:** Integrate real ad SDK (Google AdMob, Meta Audience Network) - recommended for production
  - [ ] **Option B:** Keep simulation for MVP launch - acceptable if documented
  - **Status:** ✅ FUNCTIONAL (simulated) - Works but not monetized
  - **Impact:** No revenue from ads, but functional for MVP testing

### Push Notifications (Partially Done)
- [ ] **Complete Push Notification Setup**
  - [x] **Done:** Notification permissions flow implemented (`ProfileScreen.tsx`)
  - [x] **Done:** In-app notifications UI (`DoorNotification.tsx`)
  - [x] **Done:** Database notifications system (`notificationService.ts`)
  - [ ] **Missing:** Actual push notification sending (external push service not integrated)
  - [ ] **Missing:** Update `ios/OpenDoors/OpenDoors.entitlements` for production (`aps-environment: production`)
  - [ ] **Missing:** Deep linking for notification taps
  - **Status:** ⚠️ PARTIAL - In-app notifications work, but no actual push notifications sent to devices
  - **Impact:** Users will see notifications when they open the app, but won't receive push notifications

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

