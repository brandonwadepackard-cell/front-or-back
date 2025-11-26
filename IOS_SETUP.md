# iOS Native App Setup Guide

## Prerequisites
- Mac with Xcode installed
- Project synced with `npx cap add ios` and `npx cap sync`

## 1. Camera Permissions (Info.plist)

After running `npx cap add ios`, you need to add camera permissions to your Info.plist file.

**Location:** `ios/App/App/Info.plist`

Add these entries inside the `<dict>` tag:

```xml
<!-- Camera Permission -->
<key>NSCameraUsageDescription</key>
<string>Brandon Hub needs access to your camera to take photos for content creation.</string>

<!-- Photo Library Permission -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Brandon Hub needs access to your photo library to select images for content.</string>

<!-- Photo Library Add Permission (iOS 11+) -->
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Brandon Hub needs permission to save photos to your library.</string>
```

### How to Edit Info.plist:

**Option 1: Using Xcode**
1. Open the project: `npx cap open ios`
2. In Xcode, navigate to `App/App/Info.plist`
3. Right-click in the file and select "Add Row"
4. Add each key-value pair above

**Option 2: Using Text Editor**
1. Open `ios/App/App/Info.plist` in any text editor
2. Add the XML entries above before the closing `</dict>` tag
3. Save the file

## 2. Push Notifications Setup

### Enable Push Notifications in Xcode:
1. Open your project in Xcode: `npx cap open ios`
2. Select your app target (App)
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and check "Remote notifications"

### Apple Developer Portal Configuration:
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to Certificates, Identifiers & Profiles
3. Select your App ID
4. Enable "Push Notifications"
5. Create an APNs key or certificate
6. Configure your backend with the APNs credentials

## 3. App Icons

A 1024x1024 master app icon has been generated at `public/ios-icons/Icon-1024.png`.

### Generate All Required Sizes

You need to create multiple icon sizes for iOS. Use one of these free tools:

**Option 1: Online Icon Generator (Easiest)**
1. Go to [App Icon Generator](https://www.appicon.co/) or [MakeAppIcon](https://makeappicon.com/)
2. Upload your `public/ios-icons/Icon-1024.png` file
3. Download the generated iOS icon set
4. Extract the zip file

**Option 2: Using Xcode (Mac only)**
1. Open Xcode: `npx cap open ios`
2. Go to `App/App/Assets.xcassets`
3. Right-click on `AppIcon` and select "Show in Finder"
4. Drag your 1024x1024 icon into the "App Store iOS 1024pt" slot
5. Xcode can sometimes auto-generate other sizes, or you'll need to add them manually

### Required iOS Icon Sizes:
- 20x20 @2x = 40x40 (iPhone Notification)
- 20x20 @3x = 60x60 (iPhone Notification)
- 29x29 @2x = 58x58 (iPhone Settings)
- 29x29 @3x = 87x87 (iPhone Settings)
- 40x40 @2x = 80x80 (iPhone Spotlight)
- 40x40 @3x = 120x120 (iPhone Spotlight)
- 60x60 @2x = 120x120 (iPhone App)
- 60x60 @3x = 180x180 (iPhone App)
- 1024x1024 (App Store)

### Add Icons to Xcode:
1. Open Xcode: `npx cap open ios`
2. In the Project Navigator, go to `App/App/Assets.xcassets`
3. Select `AppIcon`
4. Drag and drop each icon file to its corresponding size slot

## 4. App Display Name

To set your app's display name on the iOS home screen:

1. Open `ios/App/App/Info.plist`
2. Find or add:
```xml
<key>CFBundleDisplayName</key>
<string>Brandon Hub</string>
```

## 5. Launch Screen (Splash Screen)

Your launch screen is configured at:
`ios/App/App/Base.lproj/LaunchScreen.storyboard`

You can customize it using Xcode's Interface Builder or replace it with your own design.

## 6. Build and Run

After all configurations:

```bash
# Sync changes
npx cap sync

# Build the web assets
npm run build

# Open in Xcode
npx cap open ios

# Then in Xcode:
# 1. Select your device or simulator
# 2. Click the Play button (or Cmd+R) to build and run
```

## 7. Testing Native Features

Once running on a device or simulator:
- Navigate to Tools → Native Features
- Test camera access
- Test haptic feedback
- Test push notification registration

## Troubleshooting

**Camera not working:**
- Check that permissions are added to Info.plist
- Check device privacy settings
- Make sure you're testing on a real device (simulator camera is limited)

**Push notifications not registering:**
- Ensure capabilities are enabled in Xcode
- Push notifications don't work in simulator (need real device)
- Check that APNs is configured in Apple Developer Portal

**App won't build:**
- Run `npx cap sync` after any changes
- Clean build folder in Xcode (Product → Clean Build Folder)
- Check that all dependencies are installed

## Useful Commands

```bash
# Add iOS platform
npx cap add ios

# Sync changes to iOS
npx cap sync

# Update Capacitor
npx cap update ios

# Open in Xcode
npx cap open ios

# Build web assets
npm run build
```

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
