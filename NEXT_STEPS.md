# 🎯 Next Steps - Action Plan

**Last Updated:** After notification testing (daily play ✅, bonus play ✅)

---

## 🔴 **Priority 1: Test Referral System** (1-2 hours)

**Why:** This is the most complex feature and **completely untested**. If it's broken, users won't get referral rewards, which hurts trust and retention.

**Steps:**

### Quick Test (30-45 min):
1. **Get your referral code:**
   - Open app → Home → "Earn Rewards" → "Refer a Friend"
   - Note your referral code: `_______________`

2. **Test deep link (if possible):**
   - Copy referral link
   - Try opening it on device (may need to set up deep linking first)
   - OR skip to manual testing below

3. **Manual signup test:**
   - Create a **new test account** (use a different email)
   - During signup, manually enter referral code (if there's a field)
   - OR sign up normally, then check if referral was captured

4. **Play first game:**
   - Login as new user
   - Complete survey/tutorial
   - Play first game
   - **Check:** Do you see notification popup for earned reward?
   - **Check:** Does +1 door appear in earned rewards?

5. **Check referrer account:**
   - Login as original account (referrer)
   - **Check:** Do you see notification popup?
   - **Check:** Does +1 door appear in earned rewards?

6. **Database check:**
   ```sql
   -- Check referrals table
   SELECT * FROM referrals 
   WHERE referrer_id = '[YOUR_USER_ID]' OR referred_id = '[NEW_USER_ID]';
   
   -- Should show 1 row with both IDs, referred_played_first_game = true
   ```

**If it works:** ✅ You're in great shape! Move to Priority 2.

**If it doesn't work:** ⚠️ Note the issue and we'll fix it. This is why we test!

---

## 🟠 **Priority 2: Quick Error Handling Test** (15-20 min)

**Why:** Verify app doesn't crash on common scenarios.

**Quick tests:**
1. **Network failure:**
   - Turn off WiFi/data → Open app
   - Try to play game → Should show error, not crash
   - Try to load rewards → Should show error, not crash

2. **Permission denied:**
   - Deny location permission (if prompted)
   - App should continue working (may show limited games)

3. **Invalid states:**
   - Try to play with 0 doors → Should prevent/alert

**Expected:** Error messages, no crashes.

---

## 🟡 **Priority 3: App Store Prep** (Can do in parallel)

**While testing or after:**

1. **Screenshots** (1-2 hours):
   - Take 3-5 screenshots of key screens
   - Home screen
   - Game screen
   - Rewards screen
   - Profile screen
   - Can use iOS Simulator or device

2. **Privacy Policy** (15-30 min):
   - Use GitHub Pages + generator (see `PRIVACY_POLICY_OPTIONS.md`)
   - Get URL → Update in App Store Connect
   - Update `ProfileScreen.tsx` line 506 with URL

3. **App Store Connect metadata:**
   - Description (draft)
   - Keywords
   - Category
   - Support URL

---

## 📊 **Current Status**

✅ **Complete:**
- Core features implemented
- AdMob integrated (iOS production)
- Notifications working (daily play, bonus play tested)
- Error handling implemented
- Apple Developer approved
- Bundle ID registered

⚠️ **Needs Testing:**
- Referral system (highest priority)
- Error scenarios
- Complete user journey end-to-end

📝 **Needs Prep:**
- App Store assets (screenshots, metadata)
- Privacy policy URL

---

## 🎯 **Recommended Order**

**Today:**
1. Test referral system (Priority 1) - **Do this first**
2. Quick error handling test (Priority 2)

**This Week:**
3. Start App Store assets (screenshots)
4. Set up privacy policy URL

**Next Week:**
5. Complete App Store Connect metadata
6. Final code cleanup (remove debug logs)
7. Build for TestFlight
8. TestFlight testing
9. Submit to App Store

---

## ⏱️ **Time Estimate**

- **If referral test passes:** 1-2 weeks to launch
- **If referral test finds issues:** 2-4 weeks (fix + retest)

---

**Focus:** Test referral system first. It's the highest risk item.

