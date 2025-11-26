# QR Code Sharing Setup Guide

Complete guide for setting up QR code generation and scanning in Brandon Hub.

## Features

### QR Code Generation
- **Deep Link QR Codes**: Generate QR codes that open specific app sections
- **Custom Content QR**: Create QR codes with any text or URL (up to 2000 characters)
- **Download & Share**: Save QR codes as images or share via native share sheet

### QR Code Scanning
- **Native Camera Scanning**: Use device camera to scan QR codes
- **Auto-Navigation**: Deep links automatically navigate to app sections
- **Content Detection**: Handles URLs, deep links, and custom text

## iOS Setup

### Step 1: Configure Camera Permissions

Add to `ios/App/App/Info.plist`:

```xml
<!-- Camera Permission for QR Scanning -->
<key>NSCameraUsageDescription</key>
<string>Brandon Hub needs camera access to scan QR codes.</string>
```

### Step 2: Install Dependencies

The barcode scanning plugin is already added. After syncing, run:

```bash
npx cap sync ios
```

### Step 3: Test on Device

QR code scanning requires a physical device (not simulator) for camera access.

```bash
npx cap open ios
# Build and run on physical device
```

## Android Setup

### Step 1: Configure Camera Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />
<uses-feature android:name="android.hardware.camera.autofocus" />
```

### Step 2: Sync Project

```bash
npx cap sync android
```

### Step 3: Test on Device

```bash
npx cap open android
# Build and run on physical device
```

## Usage Examples

### Generate Deep Link QR Code

1. Navigate to Tools → QR Codes
2. Select "Generate QR" tab
3. Choose a section from "Deep Link QR Code"
4. Click "Generate Deep Link QR"
5. Download or share the generated QR code

Example deep links:
- `brandonhub://dashboard` - Opens dashboard
- `brandonhub://content` - Opens content generator
- `brandonhub://calendar` - Opens calendar

### Generate Custom QR Code

1. Go to "Custom Content QR" section
2. Enter any text or URL (max 2000 characters)
3. Click "Generate Custom QR"
4. Share the QR code

Use cases:
- Share website URLs
- Embed event information
- Create contact cards
- Share WiFi credentials

### Scan QR Codes

1. Navigate to "Scan QR" tab
2. Click "Start Scanning"
3. Point camera at QR code
4. App will automatically detect and process:
   - Deep links → Navigate to section
   - URLs → Show preview with "Open" button
   - Text → Display content

## Input Validation & Security

All QR code content is validated before generation:

- **Length Limits**: Custom text limited to 2000 characters
- **Content Validation**: Uses Zod schema validation
- **Encoding**: Proper URL encoding for external links
- **No XSS**: Content is sanitized and safely rendered

## Integration with Other Features

### With Deep Linking
QR codes can contain deep links that open specific app sections:
```
brandonhub://native-features
brandonhub://analytics
brandonhub://library
```

### With Push Notifications
Include QR codes in notification images to provide quick access:
```json
{
  "notification": {
    "title": "Scan to view content",
    "image": "url-to-qr-code-image.png"
  }
}
```

### With Sharing
Generate QR codes for content and share via:
- Native share sheet (iOS/Android)
- Download as PNG image
- Copy link to clipboard

## Use Cases

### 1. Event Check-in
Generate unique QR codes for attendees and scan them at the event entrance.

### 2. Content Sharing
Create QR codes linking to specific content pieces for easy sharing on social media or print materials.

### 3. Cross-Device Access
Generate a QR code on desktop and scan with mobile to quickly access the same section.

### 4. Marketing Campaigns
Create QR codes for landing pages, promotions, or social profiles.

### 5. Team Collaboration
Share QR codes with team members to give quick access to specific dashboards or reports.

## Technical Implementation

### Libraries Used
- **qrcode.react**: QR code generation with SVG output
- **@capacitor-mlkit/barcode-scanning**: Native barcode scanning using ML Kit

### File Structure
```
src/
  pages/
    QRCodeShare.tsx         # Main QR code page
  hooks/
    use-qr-scanner.tsx      # QR scanning hook with permissions
```

### QR Code Generation
```typescript
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG
  value={content}
  size={256}
  level="H"           // High error correction
  includeMargin       // Add quiet zone
/>
```

### QR Code Scanning
```typescript
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

const { barcodes } = await BarcodeScanner.scan();
const content = barcodes[0]?.rawValue;
```

## Troubleshooting

### Scanning Not Working
- **Permission Denied**: Check camera permissions in device settings
- **Simulator Issue**: Use physical device, not simulator
- **Dark Environment**: Ensure QR code is well-lit
- **Damaged QR**: Generate a new QR code

### Generation Issues
- **QR Too Complex**: Reduce content length (max 2000 chars)
- **Download Fails**: Check browser download permissions
- **Share Not Available**: Native sharing only works on mobile devices

### Permission Errors
```bash
# Reset permissions on iOS (if needed)
xcrun simctl privacy booted reset camera <bundle-id>

# Check Android permissions
adb shell dumpsys package <package-name> | grep permission
```

## Best Practices

1. **Error Correction**: Use high error correction level (Level H) for better reliability
2. **Size**: Generate QR codes at least 256x256px for clear scanning
3. **Contrast**: Ensure high contrast between QR code and background
4. **Testing**: Test QR codes before distributing them
5. **Content Length**: Keep content concise for faster scanning

## Performance

- **Generation**: Instant (client-side)
- **Scanning**: 1-2 seconds average
- **File Size**: ~10-50KB PNG images
- **Platform Support**: iOS 11+, Android 5.0+

## Privacy & Security

- Camera access only when actively scanning
- No QR codes stored on device without user action
- All content validated before processing
- No external API calls for generation (client-side)

## Resources

- [QRCode.react Documentation](https://www.npmjs.com/package/qrcode.react)
- [Capacitor Barcode Scanning](https://github.com/capawesome-team/capacitor-mlkit/tree/main/packages/barcode-scanning)
- [QR Code Standards](https://www.qrcode.com/en/about/standards.html)

## Future Enhancements

Potential features to add:
- Custom QR code styling (colors, logo overlay)
- Batch QR code generation
- QR code analytics (scan tracking)
- Dynamic QR codes (editable destination)
- QR code templates for different use cases
