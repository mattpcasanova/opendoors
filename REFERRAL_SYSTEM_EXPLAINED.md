# 📋 Referral System - How It Works

## Current Status

### 1. **Referral Message**
**Location:** `src/components/modals/EarnRewardModal.tsx` line 55

**Message:**
```
Hey! I'm using OpenDoors - a fun game where you can win real prizes! Join me and we'll both get extra doors to play with. Download here: [URL]
```

**Status:** ✅ Hardcoded (can be customized)

---

### 2. **Referral URL - PLACEHOLDER** ⚠️

**Current URL:** `https://opendoors.app/download?ref=CODE`

**Status:** ❌ **PLACEHOLDER** - You don't own `opendoors.app`

**Where it comes from:**
- `src/components/modals/EarnRewardModal.tsx` line 44
- Falls back to `https://opendoors.app/download` if no config is set
- Can be configured via `app.config.ts` or `app.json` → `extra.referralUrl`

**Options:**
1. **Use App Store URL** (when live): `https://apps.apple.com/app/opendoors/idXXXXX?ref=CODE`
2. **Use your own domain** (if you have one): `https://yourdomain.com/download?ref=CODE`
3. **Use deep link only** (for testing): `opendoors://?ref=CODE` (works without website)

---

### 3. **Deep Linking** ✅

**Configured:** Yes, in `app.json` line 8: `"scheme": "opendoors"`

**How it works:**
- Deep link format: `opendoors://?ref=REFERRAL_CODE`
- When clicked, opens the app and captures the referral code
- Code is stored temporarily until signup

**Example:**
```
opendoors://?ref=REFE6BACC998IBD
```

**Testing:**
- On iOS Simulator: Open Safari → Type `opendoors://?ref=TESTCODE` in address bar
- On physical device: Send yourself a text with the link, tap it
- Or use `xcrun simctl openurl booted opendoors://?ref=TESTCODE` in terminal

---

### 4. **Manual Referral Code Entry** ❌

**Current Status:** **NOT IMPLEMENTED**

**What exists:**
- Signup screen only captures referral codes from deep links
- No manual input field for referral codes
- Uses `useReferralLink` hook to get code from deep link

**How it works currently:**
1. User clicks referral link → Opens app via deep link
2. Referral code is captured and stored
3. User signs up → Code is automatically used

**To add manual entry:**
- Would need to add a text input field on signup screen
- Allow user to type/paste referral code
- Pass it to `signUp()` function

---

## 🧪 **Testing Referral System**

### Option 1: Deep Link Test (Recommended)

**Steps:**
1. Get your referral code from app (Home → Earn Rewards → Refer Friend)
2. Create deep link: `opendoors://?ref=YOUR_CODE`
3. **On iOS Simulator:**
   ```bash
   xcrun simctl openurl booted "opendoors://?ref=YOUR_CODE"
   ```
4. App should open, code captured
5. Sign up with new account
6. Play first game
7. Check both accounts get +1 door

### Option 2: Manual Testing (If you add manual entry)

1. Get referral code from app
2. Sign up new account
3. Manually enter referral code (if field exists)
4. Play first game
5. Check both accounts get +1 door

### Option 3: Website Link (When you have website)

1. Share link: `https://yourwebsite.com/download?ref=CODE`
2. Website redirects to App Store or deep link
3. User downloads app
4. Code is captured when app opens
5. Sign up → Play game → Rewards granted

---

## 🔧 **What Needs to Be Fixed**

### Priority 1: Update Referral URL

**Option A: Use App Store URL (when live)**
```typescript
// In app.config.ts or app.json
extra: {
  referralUrl: "https://apps.apple.com/app/opendoors/idXXXXX"
}
```

**Option B: Use Deep Link Only (for now)**
- Update message to say "Open this link: `opendoors://?ref=CODE`"
- Works without website
- Users can copy/paste link

**Option C: Add manual entry field**
- Add text input on signup screen
- Allow paste from clipboard
- Works for all scenarios

---

## 📝 **Recommendations**

**For Testing Now:**
1. Use deep link: `opendoors://?ref=CODE` ✅ (works without website)
2. Test on iOS Simulator with command above
3. Verify code capture → signup → first game → rewards

**For Production:**
1. **Option 1:** Use App Store URL when app is live
2. **Option 2:** Set up your own domain/website
3. **Option 3:** Add manual referral code input field (more flexible)

**Best Solution:** Combine deep link + manual entry for maximum compatibility

---

**Bottom Line:**
- ✅ Deep linking works (no website needed)
- ⚠️ URL is placeholder (doesn't matter if you use deep links)
- ❌ Manual entry not implemented (can add if needed)
- ✅ System works for testing via deep links

