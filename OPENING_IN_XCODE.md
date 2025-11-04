# Opening Project in Xcode

## Quick Answer: You Don't Need Xcode Open!

For most development, you **don't need to open Xcode**. Just use:

```bash
npx expo run:ios --device
```

This automatically:
- Builds the native code
- Opens Xcode in the background (if needed)
- Installs on your device
- Starts the dev server

## But If You Want to Open Xcode Directly

### Option 1: Generate Native Projects (If Not Already Done)

First, make sure native projects are generated:

```bash
# Generate iOS native project (if not already done)
npx expo prebuild

# Or if you want to regenerate everything:
npx expo prebuild --clean
```

### Option 2: Open the Workspace (Not Project!)

**Important**: Always open the `.xcworkspace` file, NOT `.xcodeproj`!

```bash
# From your project root directory
open ios/OpenDoors.xcworkspace
```

Or manually:
1. Open **Finder**
2. Navigate to `opendoors/ios/`
3. Double-click **`OpenDoors.xcworkspace`** (not `.xcodeproj`!)

### Why `.xcworkspace` and Not `.xcodeproj`?

- This project uses **CocoaPods** for dependencies (AdMob, etc.)
- CocoaPods creates a `.xcworkspace` that includes both:
  - Your app project (`OpenDoors.xcodeproj`)
  - Pod dependencies (`Pods/Pods.xcodeproj`)
- Opening `.xcodeproj` directly will cause build errors!

## What You Can Do in Xcode

Once Xcode is open, you can:

1. **Build and Run**: Click the play button (▶️) or press `⌘R`
2. **Select Device**: Choose device from dropdown (next to play button)
3. **View Logs**: See console output in bottom panel
4. **Edit Native Code**: Modify Swift files in `OpenDoors/` folder
5. **Configure Settings**: Edit Info.plist, entitlements, etc.
6. **Debug**: Set breakpoints in Swift/Objective-C code
7. **View Build Settings**: Configure signing, capabilities, etc.

## Common Xcode Tasks

### Change Bundle Identifier

1. Select **OpenDoors** project in left sidebar
2. Select **OpenDoors** target
3. Go to **General** tab
4. Change **Bundle Identifier** (e.g., `com.opendoors.app`)

### Configure Signing

1. Select **OpenDoors** project in left sidebar
2. Select **OpenDoors** target
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (Apple Developer account)
5. Xcode will automatically manage provisioning profiles

### Edit Info.plist

1. In Xcode, navigate to `OpenDoors/Info.plist`
2. Edit values directly in Xcode
3. Or right-click → **Open As → Source Code** for XML editing

### Add Native Modules

1. Install package: `npm install <package>`
2. Run: `npx expo prebuild` (if needed)
3. Install pods: `cd ios && pod install`
4. Reopen workspace in Xcode

## Troubleshooting

### "No such module" Errors

```bash
cd ios
pod install
cd ..
```

Then reopen Xcode workspace.

### "Signing for OpenDoors requires a development team"

1. In Xcode: Select project → Target → **Signing & Capabilities**
2. Select your **Team** from dropdown
3. If team not listed: **Xcode → Preferences → Accounts** → Add Apple ID

### "Workspace not found" or "Project not found"

```bash
# Regenerate native projects
npx expo prebuild --clean

# Then open workspace
open ios/OpenDoors.xcworkspace
```

### Build Errors After Pod Changes

```bash
cd ios
pod install
cd ..
```

Then **clean build** in Xcode: `⌘⇧K` (Product → Clean Build Folder)

## When to Use Xcode vs Command Line

### Use Command Line (`npx expo run:ios`) When:
- ✅ Regular development
- ✅ Testing features
- ✅ Quick iterations
- ✅ You don't need to edit native code

### Use Xcode When:
- ✅ Editing Swift/Objective-C files
- ✅ Configuring native settings (Info.plist, entitlements)
- ✅ Debugging native code
- ✅ Setting up code signing for first time
- ✅ Adding native capabilities (push notifications, etc.)
- ✅ Viewing detailed build logs

## Recommended Workflow

**For most development:**
```bash
# Just use this - no Xcode needed!
npx expo run:ios --device
```

**When you need Xcode:**
```bash
# Open Xcode
open ios/OpenDoors.xcworkspace

# Make your changes in Xcode
# Build and run from Xcode (⌘R)
```

**After making native changes:**
```bash
# If you modified pods or native dependencies
cd ios && pod install && cd ..
```

## Quick Reference

| Task | Command |
|------|---------|
| Generate native projects | `npx expo prebuild` |
| Open in Xcode | `open ios/OpenDoors.xcworkspace` |
| Install pods | `cd ios && pod install` |
| Build and run | `npx expo run:ios --device` |
| Clean build | In Xcode: `⌘⇧K` |

