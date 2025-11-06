# Connecting Your App to Dev Server

## Your Steps Are Correct!

You're doing the right things:
1. ✅ Build with Xcode
2. ✅ Start dev server (`npx expo start --dev-client`)
3. ✅ Open app on iPhone

## Troubleshooting Connection

### Step 1: Check Server Output

When you run `npx expo start --dev-client`, look for this line:

```
› Metro waiting on exp://192.168.x.x:8081
```

**Write down that URL** - you'll need it!

### Step 2: Verify WiFi Connection

Both devices must be on the **same WiFi network**:

**On Mac:**
```bash
# Check your Mac's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On iPhone:**
- Settings → WiFi → Check network name
- Should match your Mac's network

### Step 3: Open Developer Menu on iPhone

**Method 1: Shake Device**
- Shake your iPhone (like you're shaking it)
- Developer menu should appear

**Method 2: Long Press (if shake doesn't work)**
- Long press on the app screen
- Developer menu should appear

**Method 3: If you have a physical device connected:**
- In Xcode: **Window → Devices and Simulators**
- Select your device
- Click "Open Console" - you can see logs there

### Step 4: Configure Bundler URL

In the developer menu:
1. Tap **"Configure Bundler"** or **"Enter URL manually"**
2. Enter the URL from Step 1 (e.g., `exp://192.168.1.100:8081`)
3. Or use the IP address shown in terminal (e.g., `192.168.1.100:8081`)

### Step 5: Alternative - Use IP Address Directly

If the `exp://` URL doesn't work, try:
1. Get your Mac's IP address (from Step 2)
2. In developer menu, enter: `192.168.x.x:8081` (replace x.x with your IP)

## Common Issues

### Issue 1: "Cannot connect to development server"

**Causes:**
- Different WiFi networks
- Firewall blocking connection
- Wrong IP address

**Fix:**
1. Check both devices are on same WiFi
2. Try disabling Mac firewall temporarily
3. Verify IP address is correct

### Issue 2: Developer Menu Doesn't Appear

**Fix:**
1. Make sure you built with **development build** (not production)
2. The app must have `expo-dev-client` installed
3. Try harder shake or different gesture

### Issue 3: App Opens But Shows Error Screen

**Fix:**
1. Check terminal for error messages
2. Try reloading: Shake device → "Reload"
3. Check if server is still running

### Issue 4: "No apps connected" in Terminal

**This is normal!** The terminal shows this until:
- The app successfully connects
- You'll see logs appear when connected

## Verify Connection

**When connected, you'll see:**
- Terminal shows logs (e.g., "Reloading apps")
- App loads your code
- Changes hot-reload automatically

**If not connected:**
- App shows error screen
- Terminal shows "No apps connected"
- No logs appear

## Quick Test

1. **Start server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Note the URL** shown (e.g., `exp://192.168.1.100:8081`)

3. **Open app on iPhone**

4. **Shake device** → Developer menu

5. **Enter URL manually** if auto-connect doesn't work

6. **Check terminal** - you should see connection logs

## Still Not Working?

Try this debug version:
```bash
npx expo start --dev-client --scheme opendoors --tunnel
```

The `--tunnel` flag uses Expo's tunneling service (works even if WiFi is different, but slower).



