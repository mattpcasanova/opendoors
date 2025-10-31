# 🧪 OpenDoors Testing Script

This script helps you systematically test all critical user flows before launch.

## 📋 Pre-Testing Setup

1. **Clear app data** (fresh state):
   - iOS Simulator: Reset simulator (`Device → Erase All Content and Settings`)
   - Physical Device: Uninstall and reinstall app
   - Or use a test account you can delete

2. **Database state**:
   - Verify all migrations have been run
   - Check you have at least one active game/prize in database
   - Ensure you have a test distributor account (if testing door distribution)

---

## ✅ Critical User Flows

### Test 1: Complete User Journey (New User)
**Goal:** Verify a new user can complete the full onboarding and play flow

**Steps:**
1. [ ] Launch app (fresh install)
2. [ ] **Welcome Screen**: Tap "Get Started"
3. [ ] **Sign Up**: Create new account (note: email)
4. [ ] **Survey**: Complete preference survey
5. [ ] **Tutorial**: Complete or skip tutorial overlay
6. [ ] **Home Screen**: Verify "Ready to play?" button is visible
7. [ ] **Play Daily Game**: Tap "Ready to play?" → Play game
8. [ ] **Game Result**: Verify win/loss is recorded
9. [ ] **Home Screen**: Verify progress bar updates
10. [ ] **Rewards Tab**: Check if reward was won (navigate to Rewards)
11. [ ] **Claim Reward**: If won, claim reward

**Expected Results:**
- ✅ User successfully signs up
- ✅ Survey preferences saved
- ✅ Tutorial shows/works
- ✅ Daily game plays successfully
- ✅ Progress updates correctly
- ✅ Rewards can be viewed/claimed

**Issues Found:** 
```
[ ] 
[ ] 
[ ] 
```

---

### Test 2: Referral System Flow ⭐ **PRIORITY**
**Goal:** Verify referral code sharing and reward granting works

**Setup:**
- You'll need TWO devices/accounts (or use incognito browser + app)
- Account A: Referrer (shares link)
- Account B: Referred (signs up via link)

**Steps:**

#### Part A: Share Referral Code
1. [ ] Login as **Account A** (existing user)
2. [ ] Navigate to **Home Screen**
3. [ ] Tap **"Earn Rewards"** or similar button
4. [ ] Tap **"Refer a Friend"**
5. [ ] Verify referral code is displayed
6. [ ] Copy/share the referral link (check URL contains `?ref=CODE`)
7. [ ] Note the referral code: `________________`

#### Part B: Sign Up with Referral Code
8. [ ] **Option 1 (Deep Link)**: Open referral link on device → Should open app
9. [ ] **Option 2 (Manual)**: During signup, manually enter referral code
10. [ ] Create **Account B** (new user) via referral link/code
11. [ ] Verify signup completes successfully

#### Part C: First Game & Reward Granting
12. [ ] Login as **Account B** (referred user)
13. [ ] Complete survey/tutorial if needed
14. [ ] Play first game (this triggers referral reward)
15. [ ] **Check Account B**: Verify notification popup appears for earned reward
16. [ ] **Check Account B**: Verify +1 door appears in earned rewards
17. [ ] **Check Account A**: Verify notification popup appears (referrer got reward)
18. [ ] **Check Account A**: Verify +1 door appears in earned rewards

#### Part D: Database Verification
19. [ ] Check `referrals` table:
   ```sql
   SELECT * FROM referrals WHERE referrer_id = '[Account A ID]' OR referred_id = '[Account B ID]';
   ```
   - Should show 1 row with both user IDs
   - `referred_played_first_game` should be `true`
   
20. [ ] Check `door_notifications` table:
   ```sql
   SELECT * FROM door_notifications WHERE user_id IN ('[Account A ID]', '[Account B ID]') ORDER BY created_at DESC;
   ```
   - Should show 2 notifications (one for each user)
   - Both should have `read = false` initially

#### Part E: Edge Cases
21. [ ] **Self-referral**: Try using your own referral code → Should be blocked/rejected
22. [ ] **Invalid code**: Try random referral code → Should handle gracefully
23. [ ] **Duplicate referral**: Account B tries to use another referral code → Should be blocked (already referred)

**Expected Results:**
- ✅ Referral code displayed correctly
- ✅ Referral link includes code in URL
- ✅ Deep link captures code OR manual entry works
- ✅ Account B signup captures referral code
- ✅ After first game, BOTH users get +1 door
- ✅ Both users receive notification popups
- ✅ Database records referral relationship correctly
- ✅ Edge cases handled properly

**Issues Found:**
```
[ ] 
[ ] 
[ ] 
```

---

### Test 3: Notification System
**Goal:** Verify all notification triggers work correctly

#### A. Daily Reset Notification
1. [ ] Enable notifications in Profile settings
2. [ ] Play daily game (use up daily play)
3. [ ] Wait for next day OR manually change system date to tomorrow
4. [ ] Open app (or come to foreground)
5. [ ] Verify push notification received: "New Play Available! 🎮"
6. [ ] Verify "Ready to play?" button is available (not grayed out)

#### B. Doors Received Notification
7. [ ] As a distributor (or have someone), send doors to test user
8. [ ] **As recipient**: Verify notification popup appears
9. [ ] **As recipient**: Verify popup shows correct door count and distributor name
10. [ ] Tap "Got it!" → Verify popup closes
11. [ ] Refresh app → Verify popup does NOT reappear
12. [ ] Verify earned rewards shows new doors

#### C. Expiring Rewards Notifications
13. [ ] Create a test earned reward with expiration date in 2 days (or modify existing):
    ```sql
    UPDATE earned_rewards 
    SET expires_at = NOW() + INTERVAL '2 days'
    WHERE user_id = '[YOUR_USER_ID]' AND claimed = false
    LIMIT 1;
    ```
14. [ ] Open app → Verify "expiring soon" notification appears
15. [ ] Modify expiration to tomorrow:
    ```sql
    UPDATE earned_rewards 
    SET expires_at = NOW() + INTERVAL '1 day'
    WHERE user_id = '[YOUR_USER_ID]' AND claimed = false
    LIMIT 1;
    ```
16. [ ] Open app → Verify "expiring tomorrow" notification appears

#### D. Bonus Play Notification
17. [ ] Play 5 games (without using bonus) to earn a bonus play
18. [ ] Verify bonus popup appears immediately when bonus is earned
19. [ ] Tap "Got it!" → Verify popup closes
20. [ ] Close and reopen app → Verify bonus popup does NOT reappear
21. [ ] Verify bonus play is available to use

#### E. Earned Reward from Ad
22. [ ] Navigate to Earn Rewards
23. [ ] Tap "Watch Ad"
24. [ ] Complete ad watch
25. [ ] Verify "Door Earned!" popup appears with correct info
26. [ ] Tap "Got it!" → Verify popup closes

**Expected Results:**
- ✅ All notification types trigger correctly
- ✅ Push notifications appear on device
- ✅ Popups show correct information
- ✅ Notifications only show once (no duplicates on refresh)
- ✅ "Got it!" marks notification as read

**Issues Found:**
```
[ ] 
[ ] 
[ ] 
```

---

### Test 4: Daily Game Reset
**Goal:** Verify daily play resets correctly at EST midnight

**Steps:**
1. [ ] Play daily game (verify "Ready to play?" becomes disabled)
2. [ ] Note current time and last play date
3. [ ] **Option A (Manual)**: Change system date to tomorrow:
   - iOS Simulator: `Device → Set Date & Time → Set to tomorrow`
   - Or use SQL: 
     ```sql
     UPDATE user_profiles 
     SET last_daily_play_date = CURRENT_DATE - 1
     WHERE id = '[YOUR_USER_ID]';
     ```
4. [ ] **Option B (Wait)**: Wait until after EST midnight
5. [ ] Refresh app or reopen
6. [ ] Verify "Ready to play?" button is enabled again
7. [ ] Verify progress shows fresh daily play available

**Expected Results:**
- ✅ Daily play resets at correct time (EST midnight)
- ✅ Button re-enables after reset
- ✅ User can play again

**Issues Found:**
```
[ ] 
[ ] 
[ ] 
```

---

### Test 5: Error Handling & Edge Cases

#### Network Failure
1. [ ] Turn off WiFi/cellular data
2. [ ] Try to play game → Should show error/handle gracefully
3. [ ] Try to claim reward → Should show error/handle gracefully
4. [ ] Turn data back on → App should recover

#### Location Permission Denied
5. [ ] Deny location permission when prompted
6. [ ] Verify app doesn't crash
7. [ ] Verify games still show (may be limited or show "location needed")

#### Invalid States
8. [ ] Try to play game with 0 doors available → Should prevent/alert
9. [ ] Try to claim already-claimed reward → Should handle gracefully
10. [ ] Play game with invalid prize data → Should handle gracefully

**Expected Results:**
- ✅ App handles errors gracefully (no crashes)
- ✅ User sees helpful error messages
- ✅ App recovers when connection restored

**Issues Found:**
```
[ ] 
[ ] 
[ ] 
```

---

## 🐛 How to Report Issues

For each issue found, note:
1. **What you were doing:** [step from test]
2. **What happened:** [actual behavior]
3. **What should happen:** [expected behavior]
4. **Screenshots/Logs:** [if applicable]

---

## 📊 Test Completion Checklist

- [ ] Test 1: Complete User Journey
- [ ] Test 2: Referral System Flow ⭐
- [ ] Test 3: Notification System
- [ ] Test 4: Daily Game Reset
- [ ] Test 5: Error Handling & Edge Cases

**Overall Status:** ☐ PASS / ☐ FAIL / ☐ PARTIAL

**Critical Issues Found:** 
```
[ ] 
[ ] 
[ ] 
```

---

## 💡 Pro Tips

- **Use SQL queries** to quickly check database state
- **Use iOS Simulator's date/time settings** to test daily resets without waiting
- **Create test accounts** with emails like `test1@opendoors.test`, `test2@opendoors.test`
- **Take screenshots** of issues for easier debugging
- **Check console logs** in Xcode/Metro for errors

---

**Last Updated:** After notification system completion
**Next Review:** Before production launch

