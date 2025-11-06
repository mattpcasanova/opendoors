# Finding Your Mac's IP Address

## Quick Method (Terminal)

Run this command in your terminal:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1
```

This will show your IP address like: `inet 192.168.1.100`

## Alternative Methods

### Method 1: System Settings (macOS)

1. **System Settings** → **Network**
2. Select your WiFi connection (left sidebar)
3. Your IP address is shown under "Status" or click "Details"

### Method 2: Terminal - More Detailed

```bash
# Shows all network interfaces
ifconfig

# Or just WiFi
ifconfig en0

# Or use this shorter command
ipconfig getifaddr en0
```

### Method 3: Network Utility

1. **Spotlight** (⌘Space) → Search "Network Utility"
2. Go to **Info** tab
3. Select your interface (usually `en0` for WiFi)
4. IP address is shown there

## Your Bundler URL Format

Once you have your IP address, your bundler URL is:

```
exp://YOUR_IP:8081
```

Example:
- IP: `192.168.1.100`
- URL: `exp://192.168.1.100:8081`

## From Expo Dev Server

When you run `npx expo start --dev-client`, it also shows the URL in the output:

```
› Metro waiting on exp://192.168.1.100:8081
```

Look for the line that says "Metro waiting on..." - that's your URL!

## Quick Reference Commands

```bash
# Get IP address quickly
ipconfig getifaddr en0

# Or see full network info
ifconfig en0 | grep "inet "
```



