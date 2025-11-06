# Deep Link Referral Testing Guide

## Test URL Format
```
opendoors://signup?ref=REFE6BACC998IBD
```

This will:
1. Open the app
2. If you're at the Welcome screen, automatically navigate to the Signup screen (after ~0.5s)
3. Auto-fill the referral code in the input field
4. Show a confirmation alert that the code was applied

## Testing Methods

### Method 1: iOS Simulator (Easiest)

**Terminal Command:**
```bash
xcrun simctl openurl booted "opendoors://signup?ref=REFE6BACC998IBD"
```

**Steps:**
1. Start your app in the iOS simulator
2. Open Terminal
3. Run the command above (replace with actual referral code)
4. App should open to Welcome screen, then automatically navigate to Signup (after ~0.5s)
5. You should see an alert: "Referral Code Applied! 🎉"
6. Tap "Great!" on the alert
7. Check that the referral code field is pre-filled with the code
8. Check console logs for:
   - `📎 Referral code detected on Welcome screen, auto-navigating to Signup`
   - `📎 Auto-filling referral code from deep link: REFE6BACC998IBD`
9. Complete signup with the pre-filled code
10. Verify both users get rewards after first game

### Method 2: Physical Device - Messages

**Steps:**
1. Send yourself a text message with the exact message:
   ```
   Hey! I'm using OpenDoors - a fun game where you can win real prizes! Join me and we'll both get extra doors to play with.

   Open this link: opendoors://signup?ref=REFE6BACC998IBD

   Or enter referral code: REFE6BACC998IBD
   ```
2. Tap the `opendoors://signup?ref=REFE6BACC998IBD` link
3. iOS should prompt "Open in OpenDoors?"
4. Tap "Open"
5. App launches to Welcome, then auto-navigates to Signup
6. Alert appears confirming the code was applied
7. Referral code field is pre-filled
8. Complete signup and verify

### Method 3: Safari on Simulator

**Steps:**
1. Open Safari in iOS simulator
2. Type in address bar: `opendoors://signup?ref=REFE6BACC998IBD`
3. Press Enter
4. Safari should ask "Open in OpenDoors?"
5. Tap "Open"
6. Verify app navigates to Signup with code pre-filled

### Method 4: Notes App (Physical or Simulator)

**Steps:**
1. Open Notes app
2. Create a new note
3. Type the deep link: `opendoors://signup?ref=REFE6BACC998IBD`
4. The link should become clickable (blue)
5. Tap it
6. App should open to the Signup screen with code pre-filled

## What to Check

### Console Logs
Look for these logs in Xcode console or Metro bundler:

✅ **Code Detected and Auto-Navigation:**
```
📎 Referral code detected on Welcome screen, auto-navigating to Signup
```

✅ **Code Auto-filled:**
```
📎 Auto-filling referral code from deep link: REFE6BACC998IBD
```

✅ **Signup with Code:**
```
🔍 Starting signup process...
📎 Referral code found: REFE6BACC998IBD (manual)
✅ Signup successful
```

### App Behavior
- [ ] Deep link opens the app (Welcome screen appears)
- [ ] App auto-navigates to Signup screen after ~0.5 seconds
- [ ] Alert appears: "Referral Code Applied! 🎉"
- [ ] Referral code field is pre-filled with the code from the link
- [ ] No error alerts appear (besides the success confirmation)
- [ ] Signup completes successfully
- [ ] After first game, both users get +1 door

### AsyncStorage Check
You can verify the code is stored by checking AsyncStorage in React Native Debugger:
```javascript
AsyncStorage.getItem('pending_referral_code') // Should return the code
```

## Testing Scenarios

### Scenario 1: Fresh Install
1. Uninstall app
2. Reinstall app
3. Click deep link BEFORE signing up
4. Code should be captured and stored
5. Sign up
6. Verify code is used

### Scenario 2: App Already Open
1. Open app
2. Click deep link from Messages/Safari
3. App comes to foreground
4. Code should be captured
5. Navigate to signup manually
6. Verify code is used

### Scenario 3: App Closed
1. Force quit app
2. Click deep link
3. App launches
4. Code should be captured on initial URL
5. Sign up
6. Verify code is used

### Scenario 4: Manual Entry vs Deep Link
1. Click deep link (captures `REFE6BACC998IBD`)
2. On signup screen, manually enter different code in the field
3. **Expected:** Manual code takes priority
4. Verify the manual code is used, not the deep link code

## Troubleshooting

### Deep Link Doesn't Open App

**Check 1: Scheme Configuration**
- Verify [app.json](app.json) has `"scheme": "opendoors"` ✅

**Check 2: Rebuild App**
- After changing app.json, you MUST rebuild:
  ```bash
  npx expo prebuild --clean
  npx expo run:ios
  ```

**Check 3: iOS Simulator Reset**
- Sometimes simulator needs reset:
  ```bash
  xcrun simctl shutdown all
  xcrun simctl erase all
  ```

### Code Not Captured

**Check 1: Hook Initialization**
- The `useReferralLink` hook must be called BEFORE the signup screen
- Currently it's called IN the signup screen, which is correct ✅

**Check 2: AsyncStorage Permissions**
- Check console for AsyncStorage errors

**Check 3: URL Format**
- Must be exactly: `opendoors://signup?ref=CODE`
- Case sensitive: `ref` (lowercase)
- No spaces or extra characters

### Code Not Applied to Account

**Check Backend:**
1. Check `user_profiles` table for the new user
2. Verify `referred_by` field has the referrer's code
3. Check `referrals` table for the entry
4. Verify both users get doors after first game

## Expected Database State After Successful Referral

### user_profiles table
**Referrer (existing user):**
```sql
referral_code: 'REFE6BACC998IBD'  -- Their unique code
doors: 5  -- Gets +1 after referee plays first game (was 4)
```

**Referee (new user):**
```sql
referral_code: '[NEW_UNIQUE_CODE]'  -- Their own new code
referred_by: 'REFE6BACC998IBD'     -- Points to referrer
doors: 4  -- Gets +1 after playing first game (was 3)
```

### referrals table
```sql
referrer_id: [REFERRER_USER_ID]
referred_id: [REFEREE_USER_ID]
created_at: [TIMESTAMP]
reward_claimed: true  -- After first game
```

## Quick Verification Checklist

- [ ] Deep link format is correct: `opendoors://signup?ref=CODE`
- [ ] Deep link opens the app
- [ ] App navigates to Signup screen automatically
- [ ] Referral code field is pre-filled
- [ ] Console shows code auto-filled
- [ ] Signup completes without errors
- [ ] After signup, check user's `referred_by` field in database
- [ ] New user plays first game
- [ ] Both users receive +1 door
- [ ] `referrals` table has new entry

## Success Criteria

✅ **Deep link works** = App opens when link is clicked
✅ **Code captured** = Console log shows code
✅ **Signup works** = New account created with `referred_by` set
✅ **Rewards work** = Both users get +1 door after first game
