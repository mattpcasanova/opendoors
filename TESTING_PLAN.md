# OpenDoors Testing Plan (Single iPhone + Simulator)

## Setup
- **Device A (Physical iPhone)**: Main user account
- **Device B (iOS Simulator)**: Test user account

---

## Phase 1: Simulator + iPhone Testing

### 1. Setup Both Environments
- [ ] Build and run on physical iPhone
- [ ] Build and run on iOS Simulator
- [ ] Create two different user accounts (User A on phone, User B on simulator)
- [ ] Verify both are connected to same Supabase project

### 2. Real-Time Notifications Test
**User A (iPhone) → User B (Simulator)**:
- [ ] User A sends doors to User B via distributor
- [ ] Verify User B sees notification in app (no push on simulator)
- [ ] Check notification shows correct count and sender name

**User B (Simulator) → User A (iPhone)**:
- [ ] User B sends doors to User A
- [ ] User A receives notification in app
- [ ] **IMPORTANT**: User A should also get push notification (if notifications enabled)

### 3. Referral Test
**User A (iPhone) generates referral code**:
- [ ] Get User A's referral code from ProfileScreen
- [ ] Copy the code manually

**User B (Simulator) signs up with code**:
- [ ] Sign out on simulator (if already signed in)
- [ ] Create new account on simulator
- [ ] Manually enter referral code during signup
- [ ] Complete signup

**User B plays first game**:
- [ ] Play and complete first game on simulator
- [ ] Check User B earned rewards → should show +1 referral bonus
- [ ] **Switch to iPhone** → User A should see +1 referral bonus
- [ ] User A should receive push notification about referral reward

### 4. RLS Isolation Test
**Verify data separation**:
- [ ] User A plays 3 games on iPhone
- [ ] Check User A's Games Played count: should be 3
- [ ] **Switch to simulator** → User B's Games Played should be different
- [ ] User B cannot see User A's game history
- [ ] User B cannot see User A's rewards
- [ ] Each user only sees their own earned rewards

### 5. Ad Watch Test (Both Devices)
**User A (iPhone)**:
- [ ] Watch ad #1 → Earned rewards +1
- [ ] Watch ad #2 → Earned rewards +1
- [ ] Watch ad #3 → Earned rewards +1
- [ ] Try ad #4 → Should show "Daily limit reached"
- [ ] Verify count shows "0 of 3 ads remaining"

**User B (Simulator)**:
- [ ] Watch 3 ads independently
- [ ] Verify User B's limit is separate from User A's

---

## Phase 2: Single Device Account Switching

### 6. Sign Out/In Testing
**On iPhone**:
- [ ] Sign out of User A
- [ ] Sign in as User B
- [ ] Verify User B sees their own data (not User A's)
- [ ] Play a game as User B
- [ ] Sign out and back in as User A
- [ ] Verify User A's data unchanged
- [ ] Verify User A's stats updated from referral (if applicable)

### 7. Complete Game Flow Test
**User A (iPhone)**:
1. [ ] Start new game
2. [ ] Choose initial door
3. [ ] Host reveals losing door
4. [ ] Choose Stay or Switch
5. [ ] See reveal animation
6. [ ] If win: see confetti, prize appears in "My Rewards"
7. [ ] Claim prize → see QR code
8. [ ] Mark as redeemed → survey appears
9. [ ] Complete survey → +1 bonus door granted
10. [ ] Verify earned rewards count increased
11. [ ] Verify Games Played count increased
12. [ ] Verify Rewards Earned count increased

---

## Phase 3: Deep Link Testing (Safari)

### 8. Deep Link Test
**On iPhone**:
1. [ ] Go to ProfileScreen → copy your referral link
2. [ ] Expected format: `opendoors://signup?ref=REFXXXXXX`
3. [ ] Open Safari browser
4. [ ] Paste link in address bar
5. [ ] Safari should prompt "Open in OpenDoors?"
6. [ ] Tap "Open"
7. [ ] App should open to signup/auth screen
8. [ ] Referral code should be captured (check in console logs)

**Note**: If already signed in, you may need to:
- Sign out first
- Or create test with a fresh simulator instance

---

## Phase 4: Email & Notifications

### 9. Welcome Email Test
**Create new account**:
- [ ] Sign up with new email (use + trick: `youremail+test1@gmail.com`)
- [ ] Check inbox within 1 minute
- [ ] Verify welcome email received
- [ ] Check sender shows "OpenDoors" and "noreply@opendoors.app"
- [ ] Email has proper formatting and branding
- [ ] Click confirmation link → email verified

### 10. Push Notification Permissions
**Fresh install test** (if possible):
- [ ] Delete app from iPhone
- [ ] Reinstall from Xcode
- [ ] On first launch → notification permission prompt appears
- [ ] Accept permission
- [ ] Verify push token registered in database (check Supabase)
- [ ] Send test notification → receive it

**ProfileScreen toggle test**:
- [ ] Disable notifications in ProfileScreen
- [ ] Trigger notification event (have simulator send doors)
- [ ] Verify NO push notification received (in-app should still work)
- [ ] Re-enable notifications
- [ ] Trigger event again → push notification received

---

## Phase 5: Edge Cases & Bugs

### 11. Survey Bonus Stacking Test
- [ ] Win prize, claim, complete survey → +1 bonus
- [ ] Win another prize, claim, complete survey
- [ ] Verify only 1 bonus door at a time (no stacking)

### 12. Ad Limit Reset Test
**Note**: This requires waiting until midnight EST
- [ ] Use 3 ads today
- [ ] Note current time
- [ ] Wait until 12:00 AM EST (9:00 PM PST)
- [ ] Refresh app
- [ ] Verify count reset to "3 of 3"

### 13. Stay vs Switch Probability
**Play 10 games with Stay strategy**:
- [ ] Record results: __/10 wins (expected ~3-4 wins = 33%)

**Play 10 games with Switch strategy**:
- [ ] Record results: __/10 wins (expected ~6-7 wins = 67%)

### 14. Location Services
- [ ] Enable location in ProfileScreen
- [ ] Verify distance shown on prize cards
- [ ] Disable location
- [ ] Verify prizes still visible but no distance

---

## Known Limitations (Single Device)

**Cannot fully test**:
- Real-time push notifications (simulator doesn't support Expo push)
- True simultaneous multi-user interactions
- Network race conditions
- Different device OS versions (unless you have multiple simulators)

**Workarounds**:
- For push notifications: Trust that if in-app notifications work, push will too
- For simultaneous testing: Use rapid account switching
- For race conditions: Will need to test in production or with friend's device

---

## Issues Log

Document any issues found:

### Issue #1
**Description**:
**Steps to reproduce**:
**Expected behavior**:
**Actual behavior**:
**Severity**: Critical / High / Medium / Low

### Issue #2
...

---

## Sign-Off Checklist

Before submitting to App Store:
- [ ] All Phase 1-5 tests passed
- [ ] No critical or high severity issues found
- [ ] RLS policies verified secure
- [ ] Welcome email configured and tested
- [ ] Push notifications working on physical device
- [ ] Deep linking works from Safari
- [ ] All game flows tested end-to-end
- [ ] Stats tracking accurate
- [ ] No console errors in production build
