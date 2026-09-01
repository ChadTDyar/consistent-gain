# Audit: Momentum (consistent-gain)

**Date:** 2026-06-22
**Repo clean:** Yes (up to date with origin/main)

## Commits Scanned
- 9607580 chore: bump to Build 35, microblock removed + ProgressTab refresh fix
- 86d01a9 Fixed Microblock toggle & sync
- ce7c030 Changes

## Hook
- **Present:** Y (function-based, not a React hook)
- **File:** src/lib/purchases.ts
- **Routing:** `checkEntitlement()` (lines 47-66):
  - iOS native → returns TRUE immediately (auto-entitled, no RevenueCat query). Comment: "iOS native sessions are auto-entitled (Momentum iOS is free, no IAP per pricing agreement v1.1)"
  - Web → queries Supabase `profiles.is_premium`
  - Android → queries RevenueCat `customerInfo.entitlements.active['momentum_premium']`
- **Purchase routing:** PaywallModal.tsx — native: `purchaseMonthly()`/`purchaseAnnual()` (RevenueCat), web: `handleCheckout()` (Stripe)

## Raw is_premium Reads
| File | Line | Context |
|------|------|---------|
| src/pages/Coach.tsx | 31, 51-52 | `select("is_premium, plan")`, `coachUnlocked = isPremium || isIOSNative()` |
| src/pages/Profile.tsx | 23, 295 | Type definition, badge display |
| src/pages/Success.tsx | 12, 32, 37, 69, 72, 126 | Post-checkout "Welcome to Premium" |
| src/pages/Account.tsx | 21 | `select('is_premium')` |
| src/pages/Dashboard.tsx | 41, 561 | Profile type, CoachChat prop |
| src/pages/GoalDetail.tsx | 35, 57, 61, 339 | Loads is_premium, CoachChat prop |
| src/pages/Settings.tsx | 29, 474, 553, 589 | Profile type, Manage Subscription gate, delete |
| src/pages/Insights.tsx | 55-69 | Gates page: `!isIOSNative() && !canAccessFeature() → /pricing` |
| src/lib/purchases.ts | 59, 62, 83 | Web query + syncPremium |
| src/components/CoachChat.tsx | 23, 48, 183 | Props type, premium check |
| src/components/admin/AdminStats.tsx | 32, 45 | Count premium users |
| src/components/admin/AdminUsers.tsx | 14, 32, 136, 138 | List/display premium |
| src/components/AddGoalDialog.tsx | 86, 96, 100 | 3-goal limit (web only) |
| src/components/AppSidebar.tsx | 32, 39, 41, 246 | Lock Coach behind premium |

Heaviest L12 violations of all four apps. Many components read is_premium directly instead of through a centralized hook.

## Web Payment Reachable on iOS [PRIORITY]
**NONE.** All surfaces gated:

| Surface | File:Line | Gated? |
|---------|-----------|--------|
| /pricing route | App.tsx:104 | YES — `isIOSNative() ? <Navigate to="/dashboard" replace />` |
| PaywallModal | PaywallModal.tsx:30 | YES — `if (isIOSNative()) return null` |
| Settings Manage Subscription | Settings.tsx:476-491 | YES — button only shows `!isIOSNative()` |
| Settings customer portal | Settings.tsx:187 | YES — button gated by above |
| StreakRepair /pricing | StreakRepair.tsx:112 | YES — gated `!isIOSNative()` |
| DataExport /pricing | DataExport.tsx:100 | YES — gated `!isIOSNative()` |
| LandingPricing checkout | LandingPricing.tsx:90 | Rendered on landing page (unauthenticated web only) |

## RevenueCat/StoreKit
**Present:** Y
- File: src/lib/purchases.ts:1-4 — `import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'`
- API key hardcoded: `REVENUECAT_IOS_PUBLIC_KEY = 'appl_IqFsjDfSkoyXBczCICRhizbqbcE'` (public key, safe)
- Entitlement: `momentum_premium`
- **Note:** iOS auto-entitles — RevenueCat never queried on iOS. Purchase/restore functions exist but PaywallModal returns null on iOS, so they're unreachable.

## Restore
**Present:** Y
- File: src/lib/purchases.ts:68-74 — `restorePurchases()` calls `Purchases.restorePurchases()` on native, returns false on web
- Called from PaywallModal.tsx:77 (line 207 "Restore Purchases" button)
- **Note:** PaywallModal returns null on iOS, so restore button is unreachable on iOS currently

## Product IDs Referenced
- RevenueCat entitlement: `momentum_premium`
- Stripe price IDs (PaywallModal.tsx:54-56): `price_1TLRRxL98dr6Pw0kdyFkEsEp` (monthly), `price_1TLRT0L98dr6Pw0kBgfProeu` (annual)
- RevenueCat packages matched by `.product.identifier.includes('monthly'/'annual')`

## Paywall Purchase Routing
- PaywallModal (src/components/PaywallModal.tsx):
  - Line 30: `if (isIOSNative()) return null` — no paywall on iOS
  - Lines 41-43: native → `purchaseMonthly()`/`purchaseAnnual()` (RevenueCat)
  - Lines 53-59: web → `handleCheckout()` with Stripe price IDs
- UpgradeWall (src/components/UpgradeWall.tsx): Feature gate modal, uses /pricing navigation

## Pricing/Upgrade Routes
| Route | Line | Component | Protection |
|-------|------|-----------|-----------|
| /pricing | App.tsx:104 | Pricing (or Navigate) | isIOSNative() → redirect to /dashboard |
| /success | App.tsx:109 | Success | Post-checkout |
| /cancel | App.tsx:110 | Cancel | Cancellation page |

## HealthKit
- **Plugin:** @perfood/capacitor-healthkit
- **File:** src/services/healthkit.service.ts
- **Usage:** Read activity + write workouts. `saveWorkout()` saves completed workouts to Apple Health.
- **UI naming:** Called "Apple Health" in toast message (Settings.tsx:168). Not branded as "HealthKit" in UI.
- **Info.plist strings:**
  - NSHealthShareUsageDescription: "reads your Apple Health workouts and activity to track your habits automatically"
  - NSHealthUpdateUsageDescription: "saves completed workouts to Apple Health to keep your activity history in sync"

## capacitor.config
- **server.url:** N (not set, uses dist/)
- **appId:** com.chad.momentumfit

## Info.plist
- **UIDeviceFamily:** [1] (iPhone only)
- **UIRequiredDeviceCapabilities:** [arm64]
- **Purpose strings:**
  - NSHealthShareUsageDescription — read workouts/activity
  - NSHealthUpdateUsageDescription — save workouts
  - NSUserNotificationsUsageDescription — daily workout reminder
- **CFBundleVersion:** 35
- **UIBackgroundModes:** remote-notification
- **URL Scheme:** com.chad.momentumfit
