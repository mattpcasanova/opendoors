# AdMob Configuration Notes

## Current Configuration Status

### iOS (Production Ready) ✅
- **iOS App ID**: `ca-app-pub-5055120875750202~8739261688`
- **iOS Rewarded Ad Unit ID**: `ca-app-pub-5055120875750202/9079717627`
- **Status**: ✅ Production IDs configured in `app.json`

### Android (Using Test IDs) ⚠️
- **Android App ID**: `ca-app-pub-3940256099942544~3347511713` (TEST ID)
- **Android Rewarded Ad Unit ID**: `ca-app-pub-3940256099942544/5224354917` (TEST ID)
- **Status**: ⚠️ Using test IDs - replace with production IDs when ready for Android launch

## When Ready for Android Launch

1. Add Android app in AdMob console (package name: `com.opendoors.app`)
2. Create Android Rewarded ad unit
3. Get Android App ID and Android Rewarded Ad Unit ID
4. Update `app.json`:
   - Replace `androidAppId` in `react-native-google-mobile-ads` plugin
   - Replace `android` value in `extra.admob.rewardedUnitIds`

## Current Files
- Configuration: `app.json` (lines 52-58 for App IDs, lines 68-73 for Ad Unit IDs)

