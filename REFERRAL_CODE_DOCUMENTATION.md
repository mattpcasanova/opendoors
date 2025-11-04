# Referral Code System Documentation

## Overview

The referral system allows users to refer friends and earn rewards when their referred friends play their first game. There are **two ways** to use referral codes:

1. **Deep Link** (URL-based) - `opendoors://?ref=CODE`
2. **Manual Entry** - Text input on signup screen

## Manual Referral Code Entry

### How It Works

1. **User sees referral code input field** on the signup screen
2. **User enters a referral code** (e.g., `REFE6BACC998IBD`)
3. **Code is validated and stored** when user signs up
4. **Rewards are granted** after the referred user plays their first game

### Implementation Details

#### Signup Screen (`src/screens/auth/SignupScreen.tsx`)

- **Input Field**: "Referral Code (Optional)" text input
- **Location**: Below password fields, above signup button
- **Validation**: 
  - Accepts any string (case-sensitive)
  - Optional field (user can skip)
  - Auto-capitalizes input

#### Code Flow

```
User enters code → Signup → Auth Service → Referral Service → Database
```

1. **Signup Screen** (`SignupScreen.tsx`):
   ```typescript
   const referralCode = formData.referralCode; // From input field
   await signUp(email, password, firstName, lastName, phone, referralCode);
   ```

2. **Auth Service** (`src/services/auth.ts`):
   ```typescript
   // After user is created, process referral code
   if (referralCode && data.user) {
     await referralService.createReferral(referralCode, data.user.id);
   }
   ```

3. **Referral Service** (`src/services/referralService.ts`):
   ```typescript
   // Creates referral relationship in database
   await createReferral(referralCode, referredUserId);
   ```

4. **Reward Granting** (`HomeScreen.tsx`):
   ```typescript
   // After first game is played
   await referralService.checkAndGrantReferralRewards(user.id);
   ```

### Database Schema

**`referrals` table:**
- `referrer_id` - User who referred
- `referred_id` - User who was referred
- `referrer_code` - The code that was used
- `referred_played_first_game` - Boolean flag
- `first_game_played_at` - Timestamp

**`user_profiles` table:**
- `referral_code` - User's unique code (for sharing)
- `referred_by_id` - Who referred this user

### User Experience

1. **Signup Screen**:
   - User sees: "Referral Code (Optional)"
   - Helper text: "Have a friend's referral code? Enter it here and you'll both get +1 door after your first game!"
   - User enters code (e.g., `REFE6BACC998IBD`)
   - User completes signup

2. **After Signup**:
   - Referral relationship is created
   - No immediate reward (prevents abuse)

3. **After First Game**:
   - Referrer gets +1 door (popup notification)
   - Referred user gets +1 door (popup notification)
   - Push notifications sent to both users

### Testing Manual Referral Code

#### Test Scenario 1: Valid Code

1. **User A** (Referrer):
   - Sign up → Get referral code (e.g., `REFE6BACC998IBD`)
   - Share code with friend

2. **User B** (Referred):
   - Sign up → Enter referral code: `REFE6BACC998IBD`
   - Complete signup
   - Play first game
   - ✅ Both users get +1 door popup
   - ✅ Both users get push notification

#### Test Scenario 2: Invalid Code

1. **User B** signs up with invalid code: `INVALID123`
2. Signup succeeds (code is optional)
3. No referral relationship created
4. No error shown (intentional - don't block signup)

#### Test Scenario 3: Reused Code

1. **User A** shares code: `REFE6BACC998IBD`
2. **User B** signs up with code → ✅ Works
3. **User C** signs up with same code → ✅ Works (codes are reusable)
4. Both User B and User C get rewards after first game

### Code Format

- **Generated format**: `REF` + `[10 random alphanumeric characters]`
- **Example**: `REFE6BACC998IBD`
- **Case**: Uppercase letters and numbers
- **Length**: 13 characters total

### Error Handling

- **Invalid code**: Signup still succeeds, no referral created
- **Code not found**: Signup still succeeds, no referral created
- **Constraint errors**: Logged but don't block signup
- **User already referred**: Signup succeeds, but referral may not be created (constraint)

### UI Components

**Signup Screen Input:**
```tsx
<View style={styles.inputField}>
  <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
  <View style={styles.inputContainer}>
    <View style={styles.inputIconContainer}>
      <Gift size={20} color="#14B8A6" />
    </View>
    <TextInput
      style={styles.textInput}
      placeholder="Enter referral code if you have one"
      placeholderTextColor="#9CA3AF"
      value={formData.referralCode}
      onChangeText={updateReferralCode}
      autoCapitalize="characters"
      autoComplete="off"
      returnKeyType="done"
      onSubmitEditing={handleSignup}
    />
  </View>
  <Text style={styles.helperText}>
    Have a friend's referral code? Enter it here and you'll both get +1 door after your first game!
  </Text>
</View>
```

### Verification Checklist

- [x] Input field appears on signup screen
- [x] Code can be entered (case-sensitive)
- [x] Code is optional (signup works without it)
- [x] Referral relationship created in database
- [x] Rewards granted after first game
- [x] Popup notifications show for both users
- [x] Push notifications sent to both users
- [x] Codes are reusable (same code can refer multiple users)

### Known Limitations

1. **No validation feedback**: Invalid codes don't show error (by design - don't block signup)
2. **Case-sensitive**: Codes must match exactly (uppercase)
3. **No code lookup**: Can't check if code exists before signup

### Future Enhancements (Optional)

- [ ] Code validation before signup (check if code exists)
- [ ] Case-insensitive code matching
- [ ] QR code scanning for referral codes
- [ ] Referral code history/logs

