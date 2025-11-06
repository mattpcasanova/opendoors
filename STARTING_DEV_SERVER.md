# Starting Development Server

## Quick Start

Once your app is installed on your phone, start the dev server:

```bash
npx expo start --dev-client
```

This will:
- Start the Expo development server
- Show a QR code and connection info
- Your app on the phone will connect automatically (if on same WiFi)

## Step-by-Step

### 1. Start the Server

In your terminal (from project root):

```bash
npx expo start --dev-client
```

### 2. Wait for Connection

You'll see output like:
```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### 3. App Connects Automatically

- If your phone and Mac are on **same WiFi**, the app should connect automatically
- The app will reload and show your latest code changes

## Troubleshooting

### "Cannot connect to development server"

**Check:**
1. Mac and iPhone are on **same WiFi network**
2. Firewall isn't blocking connection
3. Server is actually running (check terminal output)

**Fix:**
- Make sure both devices are on the same WiFi
- Try restarting the dev server
- Check if you can see the server URL in the terminal

### App Shows Connection Error

**Manual Connection:**
1. Shake your iPhone (or long-press on device)
2. Select "Configure Bundler" or "Enter URL manually"
3. Enter the URL shown in your terminal (e.g., `exp://192.168.1.100:8081`)

### Dev Server Won't Start

**Check:**
- Port 8081 might be in use
- Try killing existing processes:
  ```bash
  lsof -ti:8081 | xargs kill -9
  ```
- Then start server again

### Need to Reload App

**Options:**
1. **Shake device** → "Reload"
2. **In terminal**: Press `r` to reload
3. **In app**: Pull down to refresh (if supported)

## Development Workflow

1. **Make code changes** in your editor
2. **Save files** - Metro bundler will detect changes
3. **App auto-reloads** (or shake device → Reload)
4. **See changes instantly** on your phone!

## Useful Commands While Server is Running

Press these keys in the terminal where dev server is running:

- `r` - Reload app
- `m` - Toggle developer menu
- `i` - Open iOS simulator
- `a` - Open Android emulator
- `w` - Open web browser
- `j` - Open debugger
- `c` - Clear cache
- `Ctrl+C` - Stop server

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Running in Background

If you want to keep the server running while doing other things:

```bash
# Start in background
npx expo start --dev-client &

# Or use a terminal multiplexer like tmux
tmux new -s expo
npx expo start --dev-client
# Press Ctrl+B then D to detach
# Later: tmux attach -t expo
```

## Multiple Devices

You can connect multiple devices to the same dev server:
- All devices must be on same WiFi
- Start server once
- Install app on multiple devices
- All devices connect to same server

## Production Builds vs Dev Server

- **Dev server** (`npx expo start --dev-client`): For development, hot reload, debugging
- **Production build**: Standalone app, no dev server needed (for App Store)

