## iOS App Icon Set

This folder contains a pre-generated Xcode `AppIcon.appiconset` covering
every size required by iOS 14+ and the App Store marketing slot (1024×1024).

### Why this exists

The App Store repeatedly rejected builds because the Xcode AppIcon asset
catalog was missing required slots or had the placeholder icon. This folder
solves that in one step.

### How to apply it on your Mac

After running `npx cap add ios` (if not already done) and `npx cap sync ios`:

```bash
# From the repo root:
rm -rf ios/App/App/Assets.xcassets/AppIcon.appiconset
cp -R icons/ios-appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset
```

Then open `ios/App/App.xcworkspace` in Xcode and confirm the AppIcon preview
shows the full set with no missing-slot warnings. Commit the resulting
`ios/App/App/Assets.xcassets/AppIcon.appiconset/` to git.

### What's in here

18 PNG sizes + `Contents.json`:

- iPhone 20/29/40/60 pt at @2x and @3x
- iPad 20/29/40 pt at @1x and @2x
- iPad 76 pt at @1x and @2x
- iPad Pro 83.5 pt at @2x
- App Store marketing 1024×1024

All PNGs are flattened RGB (no alpha channel) per App Store requirements.

### Regeneration

If the source icon changes, regenerate with:

```bash
python3 gen-appicon.py <source-1024x1024.png> icons/ios-appiconset
```

The script is in `apple-fix/gen-appicon.py` in the parent workspace. It
accepts any square PNG and upscales if smaller than 1024×1024 (a warning
is printed).
