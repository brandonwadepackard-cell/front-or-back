# Deep Linking Setup Guide

Deep linking allows external URLs to open specific sections within your Brandon Hub app.

## What is Deep Linking?

Deep links are URLs that:
- Open your app to a specific page (not just the home screen)
- Work from notifications, emails, websites, and other apps
- Improve user experience by taking users directly to relevant content

## Types of Deep Links

### 1. Custom URL Scheme
Format: `brandonhub://path`

**Example:** `brandonhub://dashboard`

- Works immediately on devices with your app installed
- Simple to implement
- Shows "Open in App" dialog on iOS/Android
- Doesn't work if app isn't installed

### 2. Universal Links (iOS) / App Links (Android)
Format: `https://yourdomain.com/path`

**Example:** `https://yourdomain.com/content`

- Opens in app if installed, otherwise opens in browser
- More seamless user experience
- Requires domain ownership and verification
- Works as regular web links

## iOS Configuration

### Step 1: Configure Custom URL Scheme

Add to `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>brandonhub</string>
    </array>
    <key>CFBundleURLName</key>
    <string>app.lovable.brandonhub</string>
  </dict>
</array>
```

### Step 2: Configure Universal Links (Optional)

1. **In Xcode:**
   - Select your app target
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "Associated Domains"
   - Add: `applinks:yourdomain.com`

2. **On Your Server:**
   Host a file at `https://yourdomain.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.app.lovable.87e65127201b46009f3b696ed9371fac",
        "paths": [
          "/dashboard",
          "/content",
          "/calendar",
          "/analytics",
          "/library",
          "/native-features"
        ]
      }
    ]
  }
}
```

Replace `TEAMID` with your Apple Developer Team ID.

## Android Configuration

### Step 1: Configure Custom URL Scheme

Add to `android/app/src/main/AndroidManifest.xml` inside the `<activity>` tag:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="brandonhub" />
</intent-filter>
```

### Step 2: Configure App Links (Optional)

Add to AndroidManifest.xml:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
    android:scheme="https"
    android:host="yourdomain.com" />
</intent-filter>
```

Host a file at `https://yourdomain.com/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.lovable.87e65127201b46009f3b696ed9371fac",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

## Available Deep Links

| Section | Custom Scheme | Universal Link |
|---------|--------------|----------------|
| Dashboard | `brandonhub://dashboard` | `https://yourdomain.com/dashboard` |
| Content Generator | `brandonhub://content` | `https://yourdomain.com/content` |
| Calendar | `brandonhub://calendar` | `https://yourdomain.com/calendar` |
| Analytics | `brandonhub://analytics` | `https://yourdomain.com/analytics` |
| Content Library | `brandonhub://library` | `https://yourdomain.com/library` |
| Native Features | `brandonhub://native-features` | `https://yourdomain.com/native-features` |
| Templates | `brandonhub://templates` | `https://yourdomain.com/templates` |
| History | `brandonhub://history` | `https://yourdomain.com/history` |
| Web Scraper | `brandonhub://scraper` | `https://yourdomain.com/scraper` |

## Testing Deep Links

### Test Custom Scheme (iOS)

1. Build and run your app on a device or simulator
2. Open Safari
3. Enter: `brandonhub://dashboard`
4. App should open to the dashboard

### Test Custom Scheme (Android)

Using ADB:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "brandonhub://dashboard" app.lovable.87e65127201b46009f3b696ed9371fac
```

### Test Universal Links

1. Send yourself a text message or email with the link
2. Click the link
3. App should open (or prompt to open)

## Using Deep Links in Push Notifications

Include deep links in your push notification payload:

```json
{
  "notification": {
    "title": "New Content Ready!",
    "body": "Your content has been generated"
  },
  "data": {
    "deeplink": "brandonhub://content"
  }
}
```

Then handle the notification tap in your app to navigate to the deep link.

## Common Issues

### Link Opens in Browser Instead of App
- Verify domain verification is complete
- Check that app is installed on device
- Universal links take 24-48 hours to propagate after initial setup

### Custom Scheme Doesn't Work
- Check Info.plist/AndroidManifest.xml configuration
- Run `npx cap sync` after changes
- Rebuild the app

### Deep Link Opens App but Not Specific Page
- Check that route is defined in App.tsx
- Verify the URL parsing logic in use-deep-links.tsx
- Check browser console for errors

## Implementation Details

The deep linking functionality is implemented in:
- `src/hooks/use-deep-links.tsx` - Core deep link handling logic
- `capacitor.config.ts` - Capacitor configuration with custom scheme
- `src/App.tsx` - Integration point for deep link handler

## Resources

- [Capacitor App Plugin](https://capacitorjs.com/docs/apis/app#addlistenerappurlopen-)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [App Icon Generator](https://www.appicon.co/)

## Next Steps

1. Configure Info.plist and AndroidManifest.xml
2. Run `npx cap sync`
3. Build and test on device
4. Set up universal links if needed
5. Test with push notifications
