# 📱 Mobile Setup Guide - Momentum

Capacitor is now configured! Your web app can be deployed as native iOS and Android apps.

## 🚀 Quick Start

### 1. Export to GitHub
Click **"Export to GitHub"** button in Lovable to transfer your code to GitHub.

### 2. Clone and Install
```bash
git clone your-github-repo
cd consistent-gain
npm install
```

### 3. Build Web App
```bash
npm run build
```

### 4. Initialize Capacitor Platforms

**For iOS:**
```bash
npx cap add ios
npx cap update ios
npx cap sync ios
npx cap open ios
```
Requires: macOS with Xcode installed

**For Android:**
```bash
npx cap add android
npx cap update android
npx cap sync android
npx cap open android
```
Requires: Android Studio installed

### 5. Run on Device/Emulator

**iOS:**
```bash
npx cap run ios
```
Select your device/simulator in Xcode.

**Android:**
```bash
npx cap run android
```
Select your device/emulator in Android Studio.

---

## 🔧 Development Workflow

1. **Make changes in Lovable** - Edit your web app normally
2. **Pull latest code** - `git pull` from your GitHub repo
3. **Sync to mobile** - `npx cap sync` to update native platforms
4. **Test** - Run on device/emulator

---

## ✨ Mobile Features Added

### Push Notifications
- Streak reminders
- Milestone celebrations
- Daily motivation

**Setup:** Notifications auto-initialize when app opens on mobile.

### Haptic Feedback
```typescript
import { useHaptics } from '@/hooks/useMobile';

function MyComponent() {
  const haptics = useHaptics();
  
  const handleSuccess = () => {
    haptics.success(); // Success vibration
  };
}
```

### Platform Detection
```typescript
import { useIsMobile, usePlatform } from '@/hooks/useMobile';

function MyComponent() {
  const isMobile = useIsMobile();
  const platform = usePlatform(); // 'ios' | 'android' | 'web'
  
  return <div>{isMobile ? 'Mobile' : 'Web'}</div>;
}
```

### Mobile-Optimized Storage
Preferences API auto-switches between native storage (mobile) and localStorage (web).

---

## 📦 What's Included

- ✅ Capacitor Core
- ✅ iOS Platform Support
- ✅ Android Platform Support
- ✅ Push Notifications
- ✅ Haptic Feedback
- ✅ Native Storage (Preferences)
- ✅ Hot Reload Configuration

---

## 🎨 App Store Assets

### Required Assets
- **App Icon:** 1024x1024px (already in `public/app-icon.png`)
- **Splash Screen:** 2732x2732px
- **Screenshots:** Various sizes per platform

### App Store Info
- **Name:** Momentum
- **Bundle ID (iOS):** app.lovable.af90df1a17194ec1942171d77a47a441
- **Package (Android):** app.lovable.af90df1a17194ec1942171d77a47a441

---

## 🔐 Push Notifications Setup

### iOS (APNs)
1. Create App ID in Apple Developer
2. Enable Push Notifications capability
3. Generate APNs key
4. Add to Firebase/your notification provider

### Android (FCM)
1. Create Firebase project
2. Add Android app with package name
3. Download `google-services.json`
4. Place in `android/app/` directory
5. Add Firebase Cloud Messaging configuration

---

## 🐛 Troubleshooting

### "Command not found: cap"
```bash
npm install
```

### Build Errors After Git Pull
```bash
npm run build
npx cap sync
```

### Xcode Build Fails
1. Open project in Xcode: `npx cap open ios`
2. Select your team in Signing & Capabilities
3. Clean build folder (Cmd+Shift+K)
4. Build again (Cmd+B)

### Android Gradle Errors
1. Open in Android Studio: `npx cap open android`
2. Let Gradle sync
3. File → Invalidate Caches / Restart

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Running on Physical Devices](https://lovable.dev/blogs/TODO)
- [Push Notifications Guide](https://capacitorjs.com/docs/guides/push-notifications-firebase)

---

## 💡 Tips

1. **Always sync after git pull:** `npx cap sync`
2. **Test on real devices:** Emulators don't support all features
3. **Use hot reload:** Changes appear instantly without rebuilding
4. **Check native logs:** Xcode Console / Android Logcat for mobile-specific errors

---

Ready to build your mobile app! 🚀
