# Building and Running on Your Phone from Xcode

## ⚠️ Important: Choose ONE Method

**Don't use both Xcode AND `npx expo run:ios` at the same time!** They will conflict.

### Option 1: Build from Xcode Only
- Build and run from Xcode (▶️ button)
- **Then** start dev server: `npx expo start --dev-client`
- **Don't** run `npx expo run:ios --device` after building from Xcode

### Option 2: Build from Command Line Only
- Run: `npx expo run:ios --device`
- This builds AND installs automatically
- **Don't** build from Xcode at the same time

**If you build from Xcode, just start the dev server afterward. Don't run `npx expo run:ios --device`.**

## Quick Steps

1. **Select Your Device**
   - At the top of Xcode, next to the play button (▶️)
   - Click the device dropdown (usually shows "Any iOS Device" or a simulator)
   - Select your iPhone from the list

2. **Configure Signing** (First Time Only)
   - Select **OpenDoors** project in left sidebar (blue icon)
   - Select **OpenDoors** target
   - Go to **Signing & Capabilities** tab
   - Under **Team**, select your Apple Developer account
   - Xcode will automatically create a provisioning profile

3. **Build and Run**
   - Click the **Play button** (▶️) in top-left
   - Or press `⌘R` (Command + R)
   - Wait for build to complete
   - App will install and launch on your phone!

## Detailed Step-by-Step

### Step 1: Connect Your Device

**Wireless (if already set up):**
- Make sure iPhone and Mac are on same WiFi
- Device should appear in Xcode automatically

**USB (if not set up wirelessly):**
- Connect iPhone to Mac via USB
- Unlock iPhone and trust computer if prompted
- Device should appear in Xcode

### Step 2: Select Your Device

1. Look at the **top toolbar** in Xcode
2. Find the **device selector** (dropdown next to play button)
3. Click it and select your iPhone from the list
   - It will show your device name (e.g., "Matt's iPhone")
   - If you don't see it, see troubleshooting below

### Step 3: Configure Code Signing (First Time Only)

1. In **left sidebar**, click the **blue project icon** (OpenDoors)
2. Make sure **OpenDoors** target is selected (under TARGETS)
3. Click **Signing & Capabilities** tab
4. Under **Signing**, check **"Automatically manage signing"**
5. Select your **Team** from dropdown:
   - If you see your Apple ID, select it
   - If not, click **"Add Account..."** and sign in
6. Xcode will automatically:
   - Create a provisioning profile
   - Set bundle identifier
   - Configure capabilities

### Step 4: Build and Run

**Option A: Play Button**
- Click the **▶️ Play button** in top-left toolbar
- Or press `⌘R` (Command + R)

**Option B: Menu**
- **Product → Run** (or `⌘R`)

**What happens:**
1. Xcode builds the app (you'll see progress in top bar)
2. App installs on your phone
3. App launches automatically

### Step 5: Start Dev Server (Required!)

**After building from Xcode, you MUST start the dev server:**

1. Open **Terminal** (keep Xcode open if you want to see logs)
2. Navigate to project:
   ```bash
   cd /Users/mattcasanova/Projects/opendoors
   ```
3. Start dev server:
   ```bash
   npx expo start --dev-client
   ```
4. App on phone should connect automatically

**⚠️ Do NOT run `npx expo run:ios --device` after building from Xcode!** 
- Xcode already built and installed the app
- Just start the dev server (`npx expo start --dev-client`)
- Running `npx expo run:ios --device` will try to build again and conflict with Xcode

## Troubleshooting

### "No devices available" or Device Not Showing

**Check:**
1. Device is unlocked
2. USB cable is connected (if using USB)
3. "Trust This Computer" was tapped on iPhone
4. Device appears in Xcode → **Window → Devices and Simulators**

**Fix:**
- Unplug and replug USB cable
- Unlock iPhone and tap "Trust" again
- Restart Xcode

### "Signing for OpenDoors requires a development team"

**Fix:**
1. Select project → Target → **Signing & Capabilities**
2. Check **"Automatically manage signing"**
3. Select your **Team** from dropdown
4. If no team: **Xcode → Preferences → Accounts** → Add Apple ID

### "Could not find Developer Disk Image"

Your Xcode version doesn't match iOS version.

**Fix:**
- Update Xcode to latest version
- Or update iPhone iOS to match Xcode version

### Build Fails with Pod Errors

**Fix:**
```bash
cd ios
pod install
cd ..
```

Then rebuild in Xcode.

### "Cannot connect to development server"

**Fix:**
1. Make sure Mac and iPhone are on **same WiFi network**
2. Start dev server in Terminal:
   ```bash
   npx expo start --dev-client
   ```
3. Check firewall isn't blocking connection

### App Installs But Crashes Immediately

**Check logs:**
1. In Xcode, open **View → Debug Area → Show Debug Area** (`⇧⌘Y`)
2. Look at console output for error messages
3. Common issues:
   - Missing environment variables
   - Network connection issues
   - Missing native dependencies

## Xcode Interface Overview

### Top Toolbar
- **Play button (▶️)**: Build and run
- **Stop button (⏹️)**: Stop running app
- **Device selector**: Choose device/simulator
- **Scheme selector**: Choose build configuration

### Left Sidebar (Navigator)
- **Project navigator** (folder icon): File browser
- **Device selector**: Shows connected devices
- **Breakpoint navigator**: Debug breakpoints
- **Report navigator**: Build logs

### Bottom Panel
- **Debug area**: Console output and variables
- **Breakpoints**: Debugging controls
- Toggle with `⇧⌘Y` (Shift + Command + Y)

## Quick Reference

| Action | Shortcut |
|--------|----------|
| Build and Run | `⌘R` |
| Stop | `⌘.` (Command + Period) |
| Clean Build | `⌘⇧K` |
| Show Debug Area | `⇧⌘Y` |
| Show/Hide Navigator | `⌘0` |
| Show/Hide Utilities | `⌘⌥0` |

## Tips

1. **First build takes longer** - Xcode compiles everything
2. **Subsequent builds are faster** - Only changed files recompile
3. **Keep dev server running** - In Terminal, keep `expo start --dev-client` running
4. **Check device logs** - Xcode console shows real-time logs from your phone
5. **Wireless debugging** - Once set up, you don't need USB cable

## Alternative: Command Line Only (Easier!)

If you prefer not to use Xcode, you can use the command line:

```bash
npx expo run:ios --device
```

This does everything automatically:
- Builds the app
- Installs on your device
- Starts the dev server

**When using this method:**
- **Don't** build from Xcode at the same time
- **Don't** need to manually start dev server (it starts automatically)
- Just run the command and wait for it to finish

**Choose your workflow:**
- **Xcode workflow**: Build in Xcode → Start dev server manually
- **Command line workflow**: Run `npx expo run:ios --device` (does everything)

