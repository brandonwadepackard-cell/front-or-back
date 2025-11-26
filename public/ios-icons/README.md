# iOS App Icon

## Master Icon
- **Icon-1024.png** - 1024x1024px master icon for Brandon Hub

## How to Use

### Step 1: Generate All Required Sizes
Use a free online tool to generate all iOS icon sizes:
- [App Icon Generator](https://www.appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)

Upload Icon-1024.png and download the complete iOS icon set.

### Step 2: Add to Xcode
1. Run `npx cap open ios` to open your project in Xcode
2. Navigate to `App/App/Assets.xcassets`
3. Click on `AppIcon`
4. Drag and drop all generated icon files to their corresponding slots

### Required Sizes
iOS requires these icon sizes:
- 40x40 (Notification @2x)
- 60x60 (Notification @3x)
- 58x58 (Settings @2x)
- 87x87 (Settings @3x)
- 80x80 (Spotlight @2x)
- 120x120 (Spotlight @3x / App @2x)
- 180x180 (App @3x)
- 1024x1024 (App Store)

## Design Details
- Purple to blue gradient background
- Stylized brain/hub symbol
- Modern, professional appearance
- Optimized for iOS visibility

See `IOS_SETUP.md` in the project root for complete iOS configuration instructions.
