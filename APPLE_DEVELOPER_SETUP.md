# 🍎 Apple Developer Post-Approval Setup

Congratulations on your Apple Developer approval! Here's what to do now (before launch).

---

## ✅ Immediate Steps (Do Now)

### 1. Register Your Bundle ID

**Bundle ID:** `com.opendoors.app`

**Steps:**
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **"Certificates, Identifiers & Profiles"**
3. Click **"Identifiers"** in left sidebar
4. Click **"+"** button (top left)
5. Select **"App IDs"** → Click **"Continue"**
6. Select **"App"** → Click **"Continue"**
7. Fill out:
   - **Description:** `OpenDoors`
   - **Bundle ID:** Select **"Explicit"** → Enter: `com.opendoors.app`
8. Under **"Capabilities"**, enable:
   - ✅ **Push Notifications** (if you plan to use production push notifications)
   - ✅ **Associated Domains** (if you plan to use deep linking with your website)
9. Click **"Continue"** → **"Register"**

**Result:** Your bundle ID is now registered with Apple.

---

### 2. Set Up App Store Connect App Listing (Prep Work)

You can create the app listing now and prepare it, but not submit until ready.

**Steps:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill out:
   - **Platform:** iOS
   - **Name:** `OpenDoors` (or your preferred App Store name)
   - **Primary Language:** English (or your choice)
   - **Bundle ID:** Select `com.opendoors.app` (the one you just registered)
   - **SKU:** `opendoors-001` (internal identifier, can be anything unique)
   - **User Access:** Full Access (unless you need team restrictions)
4. Click **"Create"**

**What You Can Do Now (Before Launch):**
- Add app description
- Upload screenshots (you'll need these for submission)
- Set app category
- Set pricing (free or paid)
- Add privacy policy URL (if you have one)
- Prepare marketing materials

**Note:** You can save everything as a draft. Don't submit until you're ready.

---

### 3. Set Up EAS (Expo Application Services) Credentials

If you're using EAS Build (recommended), set up credentials:

**Steps:**
1. Install EAS CLI if not already: `npm install -g eas-cli`
2. Login to EAS: `eas login`
3. Link your project (if not done): `eas build:configure`
4. Set up credentials: `eas credentials`

**What EAS Will Do:**
- Automatically generate certificates and provisioning profiles
- Manage signing for you
- Handle both development and distribution certificates

**Option:** You can also manually generate certificates in Apple Developer Portal, but EAS makes it much easier.

---

## 🔄 When Ready to Build (Before Launch)

### 4. Update Entitlements for Production

**File:** `ios/OpenDoors/OpenDoors.entitlements`

**Current:**
```xml
<key>aps-environment</key>
<string>development</string>
```

**Change to:**
```xml
<key>aps-environment</key>
<string>production</string>
```

**When:** Do this right before your first production build (for TestFlight or App Store).

**Why:** 
- `development` = Works for dev builds and TestFlight internal testing
- `production` = Required for App Store builds and external TestFlight testing

---

### 5. Update Info.plist AdMob ID (Optional)

**File:** `ios/OpenDoors/Info.plist`

**Current (line 43):**
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
```

**Should be:**
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-5055120875750202~8739261688</string>
```

**Note:** This should auto-update when you rebuild with the config plugin, but you can manually update it now if you want.

---

## 📋 Pre-Launch Checklist

- [ ] Bundle ID registered in Apple Developer Portal
- [ ] App Store Connect app listing created (as draft)
- [ ] EAS credentials configured (or manual certificates)
- [ ] Entitlements updated to `production` (when ready for build)
- [ ] Info.plist AdMob ID updated (or will update on build)
- [ ] Screenshots prepared (needed for App Store submission)
- [ ] App description written
- [ ] Privacy policy URL ready (if applicable)

---

## 🚀 When You're Ready to Launch

### First Production Build

1. **Update entitlements** (step 4 above)
2. **Build for TestFlight:**
   ```bash
   eas build --platform ios --profile production
   ```
3. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios
   ```
   Or manually upload in App Store Connect

4. **Test on TestFlight** with beta testers
5. **Submit for App Store Review** when ready

---

## 📝 Notes

- **Bundle ID:** Once registered, it's permanent. Make sure `com.opendoors.app` is correct.
- **TestFlight:** Great for beta testing. You can add up to 10,000 external testers.
- **App Review:** Usually takes 24-48 hours, but can be longer.
- **EAS Build:** Handles all the certificate/provisioning complexity for you. Highly recommended.

---

## ❓ Common Questions

**Q: Do I need to do all of this now?**  
A: At minimum, register the Bundle ID. The rest can wait until closer to launch.

**Q: Can I create the App Store listing now?**  
A: Yes! Create it as a draft and fill it out over time. Don't submit until ready.

**Q: Do I need screenshots now?**  
A: You'll need them before submission, but you can add them later. App Store Connect saves drafts.

**Q: What if I'm not using EAS Build?**  
A: You'll need to manually generate certificates and provisioning profiles in Apple Developer Portal.

---

**Status:** Ready to set up - no code changes needed until you're ready to build for production!

