# Testing on Physical iOS Devices

## Prerequisites

1. **Apple Developer Account** (already approved ✅)
2. **Xcode** installed on your Mac
3. **Physical iPhone/iPad** (iOS device)
4. **USB cable** (only needed for first-time wireless setup)
5. **Same WiFi network** for Mac and iPhone

## Two Ways to Test: USB or Wireless

### Option A: Wireless Testing (No USB Cable Needed After Setup)

**First Time Setup (Requires USB):**
1. Connect iPhone to Mac via USB (one-time only)
2. Open Xcode → **Window → Devices and Simulators**
3. Select your device
4. Check **"Connect via network"** checkbox
5. Wait for device to show network icon (globe)
6. Unplug USB cable - device stays connected!

**After Setup (Wireless):**
1. Make sure Mac and iPhone are on **same WiFi network**
2. Build and install wirelessly:
   ```bash
   npx expo run:ios --device
   ```
3. App installs wirelessly, no cable needed!

### Option B: USB Testing (Always Connected)

1. Connect iPhone to Mac via USB cable
2. Unlock device and trust computer if prompted
3. Build and install:
   ```bash
   npx expo run:ios --device
   ```

## Step-by-Step: Wireless Setup (One-Time)

### 1. First-Time USB Connection

1. Connect iPhone to Mac via USB
2. Unlock iPhone and tap "Trust This Computer"
3. Open **Xcode** (if not already open)

### 2. Enable Wireless Debugging

1. In Xcode: **Window → Devices and Simulators** (or press `⌘⇧2`)
2. Select your iPhone from left sidebar
3. Check the box: **"Connect via network"**
4. Wait for network icon (🌐) to appear next to device name
5. You can now unplug the USB cable!

### 3. Verify Wireless Connection

- Device should show "Connected" even without USB
- Network icon (globe) should be visible
- Device name should be gray (not red)

### 4. Build Wirelessly

```bash
# From your project directory
npx expo run:ios --device
```

The app will build and install wirelessly!

### 5. Start Development Server

```bash
npx expo start --dev-client
```

Your phone will connect to the dev server over WiFi automatically.

## Troubleshooting Wireless Connection

### "Device not found" or "No devices available"

1. **Check WiFi**: Mac and iPhone must be on same WiFi network
2. **Re-enable wireless**: 
   - Xcode → Devices and Simulators
   - Uncheck "Connect via network"
   - Check it again
3. **Restart devices**: Restart both Mac and iPhone
4. **Reconnect USB**: Plug in USB, enable wireless, unplug again

### "Code signing failed"

1. Make sure your Apple Developer account is set up in Xcode
2. **Xcode → Preferences → Accounts**
3. Add your Apple ID and select your team

### "Cannot connect to dev server"

1. Both devices must be on **same WiFi network**
2. Check firewall isn't blocking connection
3. Try manually entering dev server URL in Expo Go/dev client

## Testing on Multiple Devices

### Option 1: One at a Time (Same WiFi)

1. Build and install on Device 1:
   ```bash
   npx expo run:ios --device
   # Select Device 1 when prompted
   ```

2. Start dev server:
   ```bash
   npx expo start --dev-client
   ```

3. Disconnect Device 1, connect Device 2

4. Install on Device 2:
   ```bash
   npx expo run:ios --device
   # Select Device 2 when prompted
   ```

5. Both devices should connect to the same dev server (same WiFi network)

### Option 2: Multiple Devices Simultaneously

1. Connect all devices via USB (or use wireless debugging)
2. Build for each device:
   ```bash
   # Terminal 1 - Device 1
   npx expo run:ios --device --device-id DEVICE1_ID
   
   # Terminal 2 - Device 2
   npx expo run:ios --device --device-id DEVICE2_ID
   ```

3. Start dev server (shared):
   ```bash
   npx expo start --dev-client
   ```

4. All devices connect to the same dev server

### Finding Device IDs

List connected devices:
```bash
xcrun xctrace list devices
```

Or in Xcode: **Window → Devices and Simulators**

## Troubleshooting

### "No devices found"

1. Check USB connection
2. Unlock device
3. Trust computer on device
4. Check Xcode → Devices shows your device

### "Code signing error"

1. Make sure your Apple Developer account is set up in Xcode
2. Open Xcode → Preferences → Accounts
3. Add your Apple ID
4. Select your team

### "Cannot connect to dev server"

1. Make sure phone and Mac are on same WiFi network
2. Check firewall isn't blocking connection
3. Try manually entering dev server URL:
   - In Expo Go or dev client, shake device
   - Enter connection URL manually

### Build Fails

1. Clean build:
   ```bash
   cd ios
   rm -rf build
   cd ..
   npx expo prebuild --clean
   ```

2. Reinstall pods:
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Testing Checklist

- [ ] App installs on device
- [ ] App launches without crashes
- [ ] Signup works
- [ ] Login works
- [ ] Location permission dialog appears
- [ ] Push notification permission dialog appears
- [ ] Game cards show distances (if location enabled)
- [ ] Referral codes work (manual entry)
- [ ] Deep links work (when implemented)
- [ ] Ads load and play
- [ ] Notifications work

## Wireless Debugging (iOS 15+)

If you want to test without USB cable:

1. Connect device via USB first time
2. In Xcode: **Window → Devices and Simulators**
3. Select your device
4. Check "Connect via network"
5. Unplug USB - device should still appear
6. Build wirelessly: `npx expo run:ios --device`

## Production Build Testing

For testing production builds (closer to App Store experience):

```bash
# Build production bundle
eas build --platform ios --profile production

# Or local build
eas build --platform ios --local
```

Then install the `.ipa` file on your device using:
- Xcode → Devices and Simulators → Install
- Or TestFlight (for beta testing)

## Notes

- **Development builds** use Expo dev client (faster iteration)
- **Production builds** use EAS build (closer to final app)
- Physical devices are **required** for testing:
  - Location services (real GPS)
  - Push notifications (real APNs)
  - Ads (real AdMob)
  - Deep links (real device behavior)

