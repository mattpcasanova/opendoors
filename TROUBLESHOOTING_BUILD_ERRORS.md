# Troubleshooting Build Errors

## "Database is locked" Error

### Error Message
```
error: unable to attach DB: error: accessing build database
... database is locked
Possibly there are two concurrent builds running in the same filesystem location.
```

### Quick Fix

**Option 1: Close Xcode and Clean**
```bash
# Kill Xcode if running
killall Xcode

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/OpenDoors-*

# Try building again
npx expo run:ios --device
```

**Option 2: Clean Build in Xcode**
1. Open Xcode
2. **Product → Clean Build Folder** (or `⌘⇧K`)
3. Close Xcode
4. Try building from command line again

**Option 3: Kill All Build Processes**
```bash
# Kill any running xcodebuild processes
pkill -f xcodebuild

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/OpenDoors-*

# Try again
npx expo run:ios --device
```

### Why This Happens

- Xcode is open and has the project locked
- Multiple build processes running simultaneously
- Corrupted DerivedData cache
- Previous build didn't exit cleanly

### Prevention

- **Close Xcode** before building from command line
- **Wait for builds to finish** before starting new ones
- **Clean build folder** if you switch between command line and Xcode

## Other Common Build Errors

### "Code signing failed"

**Fix:**
1. Open Xcode
2. Select project → Target → **Signing & Capabilities**
3. Select your **Team**
4. Make sure **"Automatically manage signing"** is checked

### "No such module" or Pod Errors

**Fix:**
```bash
cd ios
pod install
cd ..
```

### "Build failed" with CocoaPods errors

**Fix:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx expo run:ios --device
```

### "Device not found"

**Fix:**
1. Check device is connected (USB or wireless)
2. Unlock device
3. Trust computer if prompted
4. Check: `xcrun xctrace list devices`

### Build Succeeds But App Crashes

**Check:**
1. Start dev server: `npx expo start --dev-client`
2. Check console logs in Xcode
3. Verify environment variables are set
4. Check network connection

## Quick Reference

| Error | Solution |
|-------|----------|
| Database locked | Close Xcode, clean DerivedData |
| Code signing | Select team in Xcode |
| Pod errors | `cd ios && pod install` |
| Device not found | Check connection, unlock device |
| Build fails | Clean build folder (`⌘⇧K` in Xcode) |

