# 🚀 Pre-Launch Checklist - Final Steps

You're almost there! Here's what to focus on before launch.

---

## 🔴 **CRITICAL - Do Before Launch**

### 1. Test Referral System ⭐ **HIGHEST PRIORITY**
**Why:** Most complex feature, needs end-to-end verification

**Follow:** `TESTING_SCRIPT.md` → Test 2: Referral System Flow

**Must Test:**
- [ ] Share referral link from Account A
- [ ] Account B signs up with referral code
- [ ] Account B plays first game
- [ ] Both users receive +1 door and notifications
- [ ] Database records show correct referral relationship
- [ ] Edge cases: self-referral blocked, invalid codes handled

**Time:** ~30-45 minutes

**If Issues Found:** Fix immediately - this is a core feature.

---

### 2. Complete User Journey Test
**Follow:** `TESTING_SCRIPT.md` → Test 1: Complete User Journey

**Must Verify:**
- [ ] New user signup works
- [ ] Survey saves preferences
- [ ] Tutorial displays/works
- [ ] Daily game plays and records correctly
- [ ] Rewards can be claimed
- [ ] Progress tracking works

**Time:** ~15 minutes

---

### 3. App Store Assets Preparation
**Status:** You can work on this in parallel with testing

**Required:**
- [ ] **Screenshots** (required for submission):
  - iPhone 6.7" display (required)
  - iPhone 6.5" display (optional but recommended)
  - At least 3-5 screenshots showing key features
- [ ] **App Description** (draft in App Store Connect)
- [ ] **Keywords** (up to 100 characters)
- [ ] **Privacy Policy URL** (required - can be simple page for now)
- [ ] **Support URL** (can be email or website)
- [ ] **Category** selection

**Time:** ~1-2 hours (screenshots take time)

**Note:** You can save all of this as draft in App Store Connect.

---

## 🟠 **HIGH PRIORITY - Should Do Before Launch**

### 4. Error Handling Quick Test
**Follow:** `TESTING_SCRIPT.md` → Test 5: Error Handling

**Quick Checks:**
- [ ] App doesn't crash on network failure
- [ ] Location permission denied handled gracefully
- [ ] Invalid states show helpful errors

**Time:** ~15 minutes

---

### 5. Production Environment Setup
**Verify:**
- [ ] Production Supabase project created (if using separate from dev)
- [ ] Production environment variables configured
- [ ] All database migrations run in production
- [ ] Test production Supabase connection

**Time:** ~30 minutes

---

## 🟡 **MEDIUM PRIORITY - Nice to Have**

### 6. Privacy Policy
**Options:**
1. **Quick:** Use a privacy policy generator (many free online)
2. **Proper:** Have lawyer draft one (if you have budget)
3. **Minimum:** Simple page stating what data you collect

**Required For:**
- App Store submission
- GDPR compliance (if EU users)
- AdMob requirements

**Time:** 30 minutes (generator) to 2 hours (custom)

---

### 7. Final Code Cleanup
- [ ] Remove/comment out debug `console.log` statements
- [ ] Review error messages are user-friendly
- [ ] Verify no test/placeholder data in production builds

**Time:** ~1 hour

---

## ⏱️ **Recommended Timeline (Before Launch)**

### Week 1: Testing & Critical Items
- **Day 1-2:** Test referral system thoroughly (Test 2)
- **Day 2-3:** Complete user journey test (Test 1)
- **Day 3:** Error handling checks (Test 5)
- **Day 4:** Fix any issues found

### Week 2: App Store Prep
- **Day 1-2:** Take screenshots (get help if needed)
- **Day 2-3:** Write app description, keywords
- **Day 3-4:** Set up privacy policy (quick version)
- **Day 4-5:** Fill out all App Store Connect metadata

### Week 3: Final Prep & Build
- **Day 1:** Production environment setup
- **Day 2:** Code cleanup (remove debug logs)
- **Day 3:** Build production app (`eas build`)
- **Day 4:** TestFlight testing
- **Day 5:** Final review → Submit to App Store

---

## 🎯 **What to Do RIGHT NOW**

Since you're "almost" ready, focus on these **3 things**:

### 1. Test Referral System (30-45 min) ⭐
   - Most complex feature
   - Catches critical bugs before launch
   - See `TESTING_SCRIPT.md` Test 2

### 2. Start App Store Assets (1-2 hours, can do over time)
   - Take screenshots (can improve later)
   - Draft description (can refine)
   - Set up privacy policy URL (simple version OK)

### 3. Quick Error Handling Check (15 min)
   - Network failure
   - Location denied
   - Invalid states

---

## ✅ **Already Complete**
- ✅ Apple Developer approved
- ✅ Bundle ID registered
- ✅ App Store Connect listing created
- ✅ AdMob iOS production IDs configured
- ✅ Database migrations run
- ✅ Notification system working
- ✅ Daily reset tested
- ✅ Error handling implemented (see `ERROR_HANDLING_STATUS.md`)

---

## 🚨 **Blockers vs Non-Blockers**

**MUST fix before launch IF found:**
- ❌ Referral system broken (test to verify it works)
- ❌ Core user flow broken (test: signup → play game → claim reward)
- ❌ App crashes on common errors (test: network failure, permission denial)

**Note:** These are examples of what WOULD stop a launch - not statements that they're currently broken. The app has error handling, but testing will verify it works.

**Can launch without (fix later):**
- ⚠️ Perfect screenshots (can update)
- ⚠️ Fancy privacy policy (simple version OK)
- ⚠️ Analytics setup (can add post-launch)
- ⚠️ Perfect error messages (can improve)

---

## 💡 **My Recommendation**

**This Week:**
1. Test referral system (Test 2) - **Do this first**
2. Quick error handling test (Test 5)
3. Start gathering screenshots

**Next Week:**
4. Complete App Store Connect metadata
5. Set up privacy policy
6. Production environment final check

**Before Build:**
7. Code cleanup (remove debug logs)
8. Update entitlements to `production`
9. Build and test on TestFlight

---

**Priority:** Test referral system first - it's the most complex feature and highest risk if broken.

**Time to Launch Estimate:** 1-2 weeks if no critical issues found.

---

**Last Updated:** After Apple Developer approval
**Next Review:** Before production build

