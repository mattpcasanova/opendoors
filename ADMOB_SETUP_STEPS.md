# 📺 AdMob Setup Steps - Quick Guide

You have your **Publisher ID**: `pub-5055120875750202` ✅

Now you need to get your **App IDs** and **Ad Unit IDs** from the AdMob console.

---

## 🎯 Step-by-Step: Get Your IDs

### 1. Add Your Apps to AdMob

1. Go to [AdMob Console](https://apps.admob.com/)
2. Click **"Apps"** in the left sidebar
3. Click **"+ ADD APP"** button
4. Select **"No"** (you haven't published the app yet)
5. Choose platform: **iOS**
   - Enter app name: `OpenDoors`
   - Bundle ID: `com.opendoors.app`
   - Click **"Add"**
6. Repeat for **Android**:
   - Enter app name: `OpenDoors`
   - Package name: `com.opendoors.app` (check `android/app/build.gradle` if different)
   - Click **"Add"**

### 2. Get Your App IDs

After adding apps, you'll see them listed. For each app:

**iOS App:**
- Find your iOS app in the list
- The **App ID** is displayed (format: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`)
- Copy it: `ca-app-pub-________________________`

**Android App:**
- Find your Android app in the list  
- The **App ID** is displayed (format: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`)
- Copy it: `ca-app-pub-5055120875750202~8739261688`

### 3. Create Rewarded Ad Units

For each app (iOS and Android):

1. Click on your app (iOS or Android)
2. Click **"ADD AD UNIT"**
3. Select **"Rewarded"** ad format
4. Enter ad unit name: `OpenDoors Rewarded iOS` (or `Android`)
5. Click **"CREATE AD UNIT"**
6. Copy the **Ad unit ID** shown (format: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`)
   - iOS Rewarded: `ca-app-pub-________________________`
   - Android Rewarded: `ca-app-pub-________________________`

---

## 📝 What You Should Have

After completing the steps above, you'll have:

1. ✅ **Publisher ID**: `pub-5055120875750202` (you already have this)
2. ⬜ **iOS App ID**: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`
3. ⬜ **Android App ID**: `ca-app-pub-XXXXXXXXXX~XXXXXXXXXX`
4. ⬜ **iOS Rewarded Ad Unit ID**: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`
5. ⬜ **Android Rewarded Ad Unit ID**: `ca-app-pub-XXXXXXXXXX/XXXXXXXXXX`

---

## 🔧 Update Your Code

Once you have all the IDs above, I can help you update `app.json` with the correct values. 

The format will be:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "iosAppId": "YOUR-IOS-APP-ID",
          "androidAppId": "YOUR-ANDROID-APP-ID"
        }
      ]
    ],
    "extra": {
      "admob": {
        "rewardedUnitIds": {
          "ios": "YOUR-IOS-REWARDED-AD-UNIT-ID",
          "android": "YOUR-ANDROID-REWARDED-AD-UNIT-ID"
        }
      }
    }
  }
}
```

---

## ⚠️ Important Notes

- **App IDs** have a **tilde (~)** in them: `ca-app-pub-XXXX~XXXX`
- **Ad Unit IDs** have a **slash (/)** in them: `ca-app-pub-XXXX/XXXX`
- Keep test IDs for development (`__DEV__` mode will use them automatically)
- Production IDs will be used in production builds
- You can create ad units before your app is published (AdMob allows this)

---

## 🚀 After You Get the IDs

Once you have all 4 IDs (2 App IDs + 2 Ad Unit IDs), let me know and I'll:
1. Update `app.json` with your production IDs
2. Verify the configuration is correct
3. Commit the changes

---

**Current Status:** 
- ✅ Publisher ID obtained: `pub-5055120875750202`
- ✅ iOS App ID obtained: `ca-app-pub-5055120875750202~8739261688`
- ✅ iOS Rewarded Ad Unit ID obtained: `ca-app-pub-5055120875750202/9079717627`
- ⚠️ Android IDs: Using test IDs for now (replace when ready for Android launch)
  - Android App ID (test): `ca-app-pub-3940256099942544~3347511713`
  - Android Rewarded Ad Unit ID (test): `ca-app-pub-3940256099942544/5224354917`

**Note:** When ready for Android launch, add Android app in AdMob and create Android Rewarded ad unit, then update `app.json` with production Android IDs.

