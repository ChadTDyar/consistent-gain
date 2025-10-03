# 🧪 Momentum - QA Test Script

## Overview
This document provides step-by-step test procedures for quality assurance before marketplace launch. Follow each section completely and document results in the tracking sheet.

---

## 🎯 Critical User Journeys

### Test 1: Complete First-Time User Journey (Desktop)
**Time Estimate:** 10 minutes  
**Prerequisites:** Clear browser cache, use incognito/private window

#### Steps:
1. [ ] Navigate to homepage at root URL
2. [ ] **First Impression Check:**
   - [ ] Page loads in <3 seconds
   - [ ] Value proposition is clear within 5 seconds
   - [ ] CTA button is visible above the fold
3. [ ] Click "Start Free" or primary CTA
4. [ ] **Sign Up Flow:**
   - [ ] Redirected to `/auth` page
   - [ ] Sign up form is clear and simple
   - [ ] Enter email: `test-[timestamp]@example.com`
   - [ ] Enter password: `TestPass123!`
   - [ ] Click "Sign Up"
   - [ ] Success message appears OR email confirmation prompt
   - [ ] Check email inbox for confirmation (if required)
   - [ ] Click confirmation link (if required)
5. [ ] **Welcome/Onboarding:**
   - [ ] Redirected to welcome page at `/welcome`
   - [ ] Onboarding message is clear
   - [ ] "Get Started" button is visible
   - [ ] Click "Get Started"
6. [ ] **Dashboard First Load:**
   - [ ] Redirected to `/dashboard`
   - [ ] Empty state shows with clear CTA
   - [ ] "Add Goal" button is prominent
7. [ ] **Create First Goal:**
   - [ ] Click "Add Goal" button
   - [ ] Modal/dialog opens
   - [ ] Enter goal name: "Morning Run"
   - [ ] Select activity type: "Running"
   - [ ] Set target: "3 times per week"
   - [ ] Click "Create Goal"
   - [ ] Goal appears on dashboard
   - [ ] Success toast notification appears
8. [ ] **Log First Activity:**
   - [ ] Find goal card for "Morning Run"
   - [ ] Click "Log Activity" button
   - [ ] Activity is recorded
   - [ ] Streak counter shows "1 day"
   - [ ] Success feedback appears
9. [ ] **Create Second Goal:**
   - [ ] Click "Add Goal" button
   - [ ] Enter goal name: "Strength Training"
   - [ ] Complete creation
   - [ ] Second goal appears on dashboard
10. [ ] **Create Third Goal:**
    - [ ] Click "Add Goal" button
    - [ ] Enter goal name: "Yoga"
    - [ ] Complete creation
    - [ ] Third goal appears on dashboard
11. [ ] **Hit Paywall (4th Goal):**
    - [ ] Click "Add Goal" button
    - [ ] Paywall modal appears
    - [ ] Message explains limit: "Free users: 3 goals. Upgrade for unlimited."
    - [ ] "Upgrade to Premium" button is visible
    - [ ] Click "Upgrade to Premium"
12. [ ] **Pricing Page:**
    - [ ] Redirected to `/pricing`
    - [ ] Pricing tiers are clear
    - [ ] Free tier shows "Current Plan" or similar indicator
    - [ ] Premium features are listed
    - [ ] Click "Upgrade" button on Premium tier
13. [ ] **Stripe Checkout (TEST MODE):**
    - [ ] Redirected to Stripe Checkout
    - [ ] Email is pre-filled
    - [ ] Enter test card: `4242 4242 4242 4242`
    - [ ] Enter expiry: Any future date (e.g., `12/25`)
    - [ ] Enter CVC: Any 3 digits (e.g., `123`)
    - [ ] Enter ZIP: Any 5 digits (e.g., `12345`)
    - [ ] Click "Subscribe" or "Pay"
    - [ ] Payment processes successfully
14. [ ] **Success Page:**
    - [ ] Redirected to `/success`
    - [ ] Success message confirms upgrade
    - [ ] "Go to Dashboard" button is visible
    - [ ] Click "Go to Dashboard"
15. [ ] **Premium Access Verified:**
    - [ ] Dashboard loads
    - [ ] Premium badge/indicator shows on UI
    - [ ] Click "Add Goal" button
    - [ ] Fourth goal creation works (no paywall)
    - [ ] Create goal: "Daily Walk"
    - [ ] Fourth goal appears successfully
16. [ ] **AI Coach Test:**
    - [ ] Click "AI Coach" or chat icon
    - [ ] Coach chat interface opens
    - [ ] Send message: "I need motivation today"
    - [ ] AI responds within 5 seconds
    - [ ] Response is relevant and encouraging
    - [ ] Close chat
17. [ ] **Settings & Profile:**
    - [ ] Navigate to `/settings`
    - [ ] User email is displayed
    - [ ] "Manage Subscription" button is visible
    - [ ] Click "Manage Subscription"
    - [ ] Opens Stripe Customer Portal in new tab
    - [ ] Portal shows subscription details
    - [ ] Close portal tab
18. [ ] **Data Export:**
    - [ ] On Settings page, find "Export Data" section
    - [ ] Click "Export Data" button
    - [ ] JSON file downloads
    - [ ] Open JSON file - verify it contains goals and activities
19. [ ] **Sign Out:**
    - [ ] Click "Sign Out" button
    - [ ] Redirected to homepage
    - [ ] No longer authenticated
20. [ ] **Sign Back In:**
    - [ ] Click "Sign In" button
    - [ ] Enter same email/password from step 4
    - [ ] Click "Sign In"
    - [ ] Redirected to dashboard
    - [ ] All 4 goals are still present
    - [ ] Streak data persists
    - [ ] Premium status persists

**Pass Criteria:**
- [ ] All steps complete without errors
- [ ] Data persists across sessions
- [ ] Premium upgrade flow works end-to-end
- [ ] No console errors (check browser DevTools)
- [ ] Total time < 12 minutes

---

### Test 2: Mobile User Journey (iOS Safari)
**Time Estimate:** 10 minutes  
**Device:** iPhone (physical device preferred, or simulator)

#### Steps:
1. [ ] Open Safari on iPhone
2. [ ] Navigate to app URL
3. [ ] **Mobile First Impression:**
   - [ ] Page loads in <4 seconds
   - [ ] All content is readable without zooming
   - [ ] No horizontal scroll
   - [ ] CTA button is easily tappable (min 44px)
4. [ ] Complete sign-up flow (steps 3-4 from Test 1)
5. [ ] Complete first goal creation (step 7 from Test 1)
6. [ ] **Mobile-Specific Tests:**
   - [ ] Tap targets are large enough (no mis-taps)
   - [ ] Keyboard doesn't cover input fields
   - [ ] Modal dialogs are scrollable if needed
   - [ ] Navigation is intuitive
7. [ ] Log activity on mobile
8. [ ] Access AI Coach chat
9. [ ] Navigate to Settings
10. [ ] Sign out and sign back in

**Pass Criteria:**
- [ ] All interactions work smoothly on mobile
- [ ] No layout issues or overlapping elements
- [ ] Touch targets are appropriately sized
- [ ] Performance is acceptable (<4s load)

---

### Test 3: Mobile User Journey (Android Chrome)
**Time Estimate:** 10 minutes  
**Device:** Android phone (physical device preferred)

Repeat Test 2 steps on Android Chrome. Document any Android-specific issues.

---

## ⚠️ Edge Case & Error Handling Tests

### Test 4: Invalid Input Handling
**Time Estimate:** 8 minutes

#### Sign Up Form Validation:
1. [ ] Navigate to `/auth` (sign up)
2. [ ] **Empty Email:**
   - [ ] Leave email blank, enter password
   - [ ] Click "Sign Up"
   - [ ] Error: "Email is required" or similar
3. [ ] **Invalid Email Format:**
   - [ ] Enter: `notanemail`
   - [ ] Click "Sign Up"
   - [ ] Error: "Invalid email format"
4. [ ] **Weak Password:**
   - [ ] Enter email: `test@example.com`
   - [ ] Enter password: `weak`
   - [ ] Click "Sign Up"
   - [ ] Error: "Password must be at least 8 characters with uppercase, lowercase, and number"
5. [ ] **Already Registered Email:**
   - [ ] Enter email that's already registered
   - [ ] Enter valid password
   - [ ] Click "Sign Up"
   - [ ] Error: "Email already registered" or similar

#### Goal Creation Validation:
6. [ ] Sign in to account
7. [ ] Click "Add Goal"
8. [ ] **Empty Goal Name:**
   - [ ] Leave name field blank
   - [ ] Click "Create"
   - [ ] Error: "Goal name is required"
9. [ ] **Goal Name Too Long:**
   - [ ] Enter 200-character goal name
   - [ ] Click "Create"
   - [ ] Error: "Goal name must be less than 100 characters"
10. [ ] **Special Characters:**
    - [ ] Enter goal name with SQL injection attempt: `'; DROP TABLE goals;--`
    - [ ] Click "Create"
    - [ ] Either: Error message OR safely escaped/created without breaking app

**Pass Criteria:**
- [ ] All invalid inputs are caught
- [ ] Error messages are clear and helpful
- [ ] No app crashes or white screens
- [ ] No sensitive errors exposed in console

---

### Test 5: Network Interruption Simulation
**Time Estimate:** 5 minutes

1. [ ] Open browser DevTools → Network tab
2. [ ] Set throttling to "Offline"
3. [ ] Try to create a goal
4. [ ] **Expected:** Error message: "Network error. Please check your connection."
5. [ ] Set throttling back to "Online"
6. [ ] Retry creating goal
7. [ ] **Expected:** Goal creates successfully
8. [ ] While loading dashboard, toggle to "Offline"
9. [ ] **Expected:** Graceful error handling, no infinite loading

**Pass Criteria:**
- [ ] App doesn't crash when offline
- [ ] Clear error messages about connectivity
- [ ] App recovers when connection returns

---

### Test 6: Payment Failure Simulation
**Time Estimate:** 5 minutes

1. [ ] Navigate to `/pricing`
2. [ ] Click "Upgrade to Premium"
3. [ ] In Stripe Checkout, use **declined card**: `4000 0000 0000 0002`
4. [ ] Complete payment details
5. [ ] Click "Pay"
6. [ ] **Expected:** Error: "Your card was declined"
7. [ ] Close Stripe Checkout
8. [ ] Retry with valid test card: `4242 4242 4242 4242`
9. [ ] **Expected:** Payment succeeds
10. [ ] Verify premium access is granted

**Pass Criteria:**
- [ ] Failed payment is handled gracefully
- [ ] User can retry payment
- [ ] No partial upgrades (user either has premium or doesn't)

---

## 🚀 Performance Tests

### Test 7: Page Load Speed (Desktop)
**Time Estimate:** 10 minutes  
**Tool:** Google Lighthouse (Chrome DevTools)

#### Homepage Performance:
1. [ ] Open Chrome DevTools → Lighthouse tab
2. [ ] Select "Performance" only
3. [ ] Select "Desktop"
4. [ ] Click "Analyze page load"
5. [ ] **Record Results:**
   - [ ] Performance Score: ___ / 100 (Target: >90)
   - [ ] First Contentful Paint: ___ s (Target: <1.8s)
   - [ ] Largest Contentful Paint: ___ s (Target: <2.5s)
   - [ ] Total Blocking Time: ___ ms (Target: <200ms)
   - [ ] Cumulative Layout Shift: ___ (Target: <0.1)

#### Dashboard Performance:
6. [ ] Navigate to `/dashboard` (logged in)
7. [ ] Run Lighthouse again
8. [ ] **Record Results:**
   - [ ] Performance Score: ___ / 100 (Target: >85)
   - [ ] First Contentful Paint: ___ s
   - [ ] Largest Contentful Paint: ___ s

**Pass Criteria:**
- [ ] Homepage: Performance >90
- [ ] Dashboard: Performance >85
- [ ] No critical Core Web Vitals failures

---

### Test 8: Page Load Speed (Mobile)
**Time Estimate:** 10 minutes  
**Tool:** Google Lighthouse (Chrome DevTools)

Repeat Test 7 with "Mobile" selected in Lighthouse.

**Pass Criteria:**
- [ ] Homepage: Performance >85
- [ ] Dashboard: Performance >80

---

### Test 9: Load Testing (Concurrent Users)
**Time Estimate:** 15 minutes  
**Tool:** k6 or Artillery (optional - requires setup)

**Simple Manual Load Test:**
1. [ ] Open 10 browser tabs
2. [ ] In each tab, navigate to homepage
3. [ ] Refresh all tabs simultaneously (Ctrl+Shift+R / Cmd+Shift+R)
4. [ ] **Expected:** All tabs load within 5 seconds
5. [ ] Sign in to 5 different accounts in 5 tabs
6. [ ] Create goals simultaneously in all 5 tabs
7. [ ] **Expected:** All operations succeed

**Automated Load Test (if using k6):**
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // 100 concurrent users
  duration: '30s',
};

export default function() {
  let res = http.get('https://yourdomain.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

Run: `k6 run load-test.js`

**Pass Criteria:**
- [ ] App handles 100 concurrent users without crashing
- [ ] Average response time stays <2s under load
- [ ] No 500 errors

---

## 🔒 Security & Privacy Tests

### Test 10: HTTPS & Security Headers
**Time Estimate:** 5 minutes  
**Tool:** Browser DevTools → Security tab

1. [ ] Navigate to homepage
2. [ ] Check address bar: **https://** (not http://)
3. [ ] Click padlock icon → "Connection is secure"
4. [ ] Open DevTools → Security tab
5. [ ] **Check:**
   - [ ] Main origin is secure
   - [ ] All resources loaded over HTTPS (no mixed content warnings)
6. [ ] Open DevTools → Network tab
7. [ ] Refresh page
8. [ ] Click any request → Headers tab
9. [ ] **Verify Security Headers:**
   - [ ] `Strict-Transport-Security` header present
   - [ ] `X-Content-Type-Options: nosniff` present
   - [ ] `X-Frame-Options: DENY` or `SAMEORIGIN` present

**Pass Criteria:**
- [ ] Entire site served over HTTPS
- [ ] No mixed content warnings
- [ ] Basic security headers in place

---

### Test 11: Authentication Security
**Time Estimate:** 10 minutes

#### Session Persistence:
1. [ ] Sign in to account
2. [ ] Open DevTools → Application tab → Local Storage
3. [ ] **Verify:** Supabase session token is present
4. [ ] Close browser completely
5. [ ] Reopen browser
6. [ ] Navigate to app
7. [ ] **Expected:** Still logged in (session persists)

#### Session Expiration:
8. [ ] In DevTools → Application → Local Storage
9. [ ] Delete all Supabase entries
10. [ ] Refresh page
11. [ ] **Expected:** Redirected to login page

#### Password Reset Flow:
12. [ ] Navigate to `/auth`
13. [ ] Click "Forgot Password"
14. [ ] Enter registered email
15. [ ] Click "Send Reset Link"
16. [ ] Check email inbox
17. [ ] Click password reset link
18. [ ] Enter new password
19. [ ] Click "Reset Password"
20. [ ] **Expected:** Password updated, can sign in with new password

**Pass Criteria:**
- [ ] Sessions persist across browser restarts
- [ ] Sessions expire when cleared
- [ ] Password reset flow works end-to-end
- [ ] No passwords stored in console logs

---

### Test 12: Data Privacy & Console Logs
**Time Estimate:** 5 minutes

1. [ ] Open DevTools → Console tab
2. [ ] Clear console
3. [ ] Navigate through complete user journey (sign up → create goal → log activity)
4. [ ] **Check Console for Sensitive Data:**
   - [ ] No passwords logged
   - [ ] No email addresses logged (acceptable in production if anonymized)
   - [ ] No API keys or tokens logged
   - [ ] No personal health data logged
5. [ ] Open DevTools → Network tab
6. [ ] Filter by "XHR" or "Fetch"
7. [ ] Click on API requests
8. [ ] **Check Request/Response:**
   - [ ] No passwords in request payloads
   - [ ] Tokens/keys are in headers, not URLs
   - [ ] Sensitive data is transmitted over HTTPS

**Pass Criteria:**
- [ ] No sensitive data in console logs
- [ ] No API keys exposed in network requests
- [ ] All sensitive data transmitted securely

---

### Test 13: Stripe Security & Webhook Testing
**Time Estimate:** 10 minutes

#### Webhook Configuration:
1. [ ] Log in to Stripe Dashboard
2. [ ] Navigate to Developers → Webhooks
3. [ ] Verify webhook endpoint: `https://yourdomain.com/functions/v1/stripe-webhook`
4. [ ] **Check Events:**
   - [ ] `checkout.session.completed` subscribed
   - [ ] `customer.subscription.updated` subscribed
   - [ ] `customer.subscription.deleted` subscribed

#### Webhook Testing:
5. [ ] In Stripe Dashboard → Webhooks → [Your Endpoint]
6. [ ] Click "Send test webhook"
7. [ ] Select `checkout.session.completed`
8. [ ] Click "Send test webhook"
9. [ ] Check webhook logs (Lovable Cloud → Backend → Edge Function Logs → `stripe-webhook`)
10. [ ] **Expected:** Event received and processed

#### Payment Security:
11. [ ] Complete a test payment on your app
12. [ ] In Stripe Dashboard → Payments
13. [ ] Verify payment appears with correct:
    - [ ] Amount
    - [ ] Customer email
    - [ ] Metadata (if any)

**Pass Criteria:**
- [ ] Webhooks configured correctly
- [ ] Test webhooks process successfully
- [ ] Payments record accurately in Stripe

---

## 🎨 User Experience Tests

### Test 14: First-Time User Test (5 Real Users)
**Time Estimate:** 2 hours (5 users × 15 min each + 30 min prep)

**Setup:**
- [ ] Recruit 5 users (friends, family, or UserTesting.com)
- [ ] Prepare brief (don't explain the app):
  > "Visit this URL and try to accomplish your fitness goals using this app. Think aloud as you use it. I'll be observing but won't help unless you're completely stuck."

**For Each User:**
1. [ ] **Observe silently** (don't interrupt)
2. [ ] **Record:**
   - Where do they click first?
   - Do they understand the value proposition immediately?
   - How long until they create their first goal?
   - Do they discover the AI Coach on their own?
   - Any confusion or hesitation points?
3. [ ] **After 10 minutes, ask:**
   - What is this app for?
   - Would you use this? Why or why not?
   - What was confusing?
   - What would you change?

**Pass Criteria:**
- [ ] 4/5 users understand the app's purpose within 30 seconds
- [ ] 4/5 users successfully create a goal within 2 minutes
- [ ] 3/5 users would actually use the app
- [ ] No major usability blockers identified

---

### Test 15: Accessibility Audit
**Time Estimate:** 15 minutes  
**Tool:** WAVE (web.dev) or Lighthouse Accessibility

#### Automated Accessibility Check:
1. [ ] Open Chrome DevTools → Lighthouse
2. [ ] Select "Accessibility" only
3. [ ] Run audit
4. [ ] **Record Score:** ___ / 100 (Target: >90)
5. [ ] Review and fix critical issues

#### Manual Keyboard Navigation:
6. [ ] Navigate homepage using only **Tab** key
7. [ ] **Check:**
   - [ ] Focus indicators are visible (blue outline or similar)
   - [ ] Tab order is logical (top to bottom, left to right)
   - [ ] All interactive elements are reachable
   - [ ] Can submit forms using Enter key
8. [ ] Navigate dashboard using only keyboard
9. [ ] Can open and close modals with keyboard
10. [ ] Can log activities without mouse

#### Color Contrast:
11. [ ] Use WAVE browser extension or Lighthouse
12. [ ] **Check:**
   - [ ] No contrast errors for text
   - [ ] Buttons have sufficient contrast
   - [ ] Error messages are readable

#### Screen Reader Test (Optional but Recommended):
13. [ ] Enable screen reader (VoiceOver on Mac, NVDA on Windows)
14. [ ] Navigate homepage
15. [ ] **Check:**
   - [ ] All images have alt text
   - [ ] Form labels are read correctly
   - [ ] Buttons are announced properly

**Pass Criteria:**
- [ ] Lighthouse Accessibility score >90
- [ ] Full keyboard navigation works
- [ ] No critical contrast issues
- [ ] Alt text present on all images

---

## 📱 Cross-Browser & Device Tests

### Test 16: Browser Compatibility
**Time Estimate:** 30 minutes

Test complete user journey on each browser:

#### Chrome (Latest)
- [ ] Sign up → Create goal → Log activity → Upgrade → Sign out
- [ ] **Issues Found:** ___

#### Safari (Latest)
- [ ] Sign up → Create goal → Log activity → Upgrade → Sign out
- [ ] **Issues Found:** ___

#### Firefox (Latest)
- [ ] Sign up → Create goal → Log activity → Upgrade → Sign out
- [ ] **Issues Found:** ___

#### Edge (Latest)
- [ ] Sign up → Create goal → Log activity → Upgrade → Sign out
- [ ] **Issues Found:** ___

**Pass Criteria:**
- [ ] Core functionality works on all 4 browsers
- [ ] No visual layout breakage
- [ ] No JavaScript errors unique to any browser

---

### Test 17: Device & Viewport Testing
**Time Estimate:** 20 minutes

Test responsive design at various breakpoints:

1. [ ] **Desktop (1920×1080)**
   - [ ] Layout uses full width appropriately
   - [ ] No excessive whitespace
   - [ ] Readable font sizes
2. [ ] **Laptop (1366×768)**
   - [ ] All content fits without horizontal scroll
   - [ ] Navigation is accessible
3. [ ] **Tablet Portrait (768×1024)**
   - [ ] Columns stack appropriately
   - [ ] Touch targets are large enough (44px min)
   - [ ] No overlapping elements
4. [ ] **Mobile (375×667) - iPhone SE**
   - [ ] Single column layout
   - [ ] All text is readable without zoom
   - [ ] Forms are usable
   - [ ] Modals fit screen height
5. [ ] **Mobile Landscape (667×375)**
   - [ ] Layout adapts
   - [ ] No critical content hidden

**Pass Criteria:**
- [ ] Responsive at all breakpoints
- [ ] No horizontal scroll on mobile
- [ ] All interactions usable on touch devices

---

## 📧 Email & Communication Tests

### Test 18: Email Deliverability
**Time Estimate:** 10 minutes

#### Welcome Email:
1. [ ] Sign up with new account
2. [ ] Check inbox within 2 minutes
3. [ ] **Expected:** Welcome email arrives
4. [ ] **Check:**
   - [ ] Sender name is correct
   - [ ] Subject line is clear
   - [ ] Email renders correctly (text + images)
   - [ ] Links work
   - [ ] No spam flags

#### Password Reset Email:
5. [ ] Trigger password reset
6. [ ] Check inbox
7. [ ] **Check:**
   - [ ] Email arrives within 1 minute
   - [ ] Reset link works
   - [ ] Link expires after use

#### Spam Score Check:
8. [ ] Forward welcome email to [mail-tester.com](https://www.mail-tester.com/)
9. [ ] **Score:** ___ / 10 (Target: >7/10)
10. [ ] Review issues (SPF, DKIM, DMARC)

**Pass Criteria:**
- [ ] All emails deliver within 2 minutes
- [ ] Spam score >7/10
- [ ] No broken links in emails

---

### Test 19: Support & Contact Flow
**Time Estimate:** 5 minutes

1. [ ] Navigate to footer → Click "Contact"
2. [ ] Fill out contact form:
   - Name: "QA Tester"
   - Email: "qa@example.com"
   - Message: "This is a test support request"
3. [ ] Click "Send"
4. [ ] **Check:**
   - [ ] Success message appears
   - [ ] Confirmation email arrives in qa@example.com
   - [ ] Support team receives notification (check support inbox)
5. [ ] Reply to support request
6. [ ] **Expected:** Reply reaches qa@example.com

**Pass Criteria:**
- [ ] Contact form submits successfully
- [ ] Confirmation email is sent
- [ ] Support team is notified

---

## 🔍 SEO & Social Sharing Tests

### Test 20: SEO Meta Tags
**Time Estimate:** 10 minutes

#### Homepage Meta Tags:
1. [ ] View page source (Ctrl+U / Cmd+U)
2. [ ] **Verify Present:**
   - [ ] `<title>` tag (50-60 characters)
   - [ ] `<meta name="description">` (150-160 characters)
   - [ ] `<meta name="keywords">`
   - [ ] `<link rel="canonical">`
   - [ ] `<meta name="robots" content="index, follow">`
3. [ ] Open page in Google Search Console or run Lighthouse SEO audit
4. [ ] **SEO Score:** ___ / 100 (Target: >90)

#### Open Graph Tags:
5. [ ] In page source, verify:
   - [ ] `<meta property="og:title">`
   - [ ] `<meta property="og:description">`
   - [ ] `<meta property="og:image">` (points to valid image)
   - [ ] `<meta property="og:url">`
   - [ ] `<meta property="og:type" content="website">`

#### Twitter Card Tags:
6. [ ] In page source, verify:
   - [ ] `<meta name="twitter:card">`
   - [ ] `<meta name="twitter:title">`
   - [ ] `<meta name="twitter:description">`
   - [ ] `<meta name="twitter:image">` (points to valid image)

**Pass Criteria:**
- [ ] All required meta tags present
- [ ] Lighthouse SEO score >90
- [ ] OG and Twitter images exist and load

---

### Test 21: Social Share Preview
**Time Estimate:** 10 minutes

#### Twitter Preview:
1. [ ] Go to [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. [ ] Enter your homepage URL
3. [ ] Click "Preview Card"
4. [ ] **Verify:**
   - [ ] Image displays correctly (1200×675)
   - [ ] Title is readable
   - [ ] Description is clear

#### Facebook Preview:
5. [ ] Go to [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
6. [ ] Enter your homepage URL
7. [ ] Click "Debug"
8. [ ] **Verify:**
   - [ ] Image displays correctly (1200×630)
   - [ ] Title and description are correct
   - [ ] No errors or warnings

#### LinkedIn Preview:
9. [ ] Go to [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
10. [ ] Enter your homepage URL
11. [ ] Click "Inspect"
12. [ ] **Verify:**
    - [ ] Image displays correctly
    - [ ] Title and description are correct

#### Slack Preview:
13. [ ] Open Slack
14. [ ] Paste your homepage URL in any channel
15. [ ] **Verify:**
    - [ ] Preview unfurls automatically
    - [ ] Image, title, description display correctly

**Pass Criteria:**
- [ ] All social previews render correctly
- [ ] No "Scraping error" messages
- [ ] Images load and are appropriately sized

---

## 📊 Analytics & Tracking Tests

### Test 22: Analytics Event Tracking
**Time Estimate:** 15 minutes

#### Setup:
1. [ ] Open Google Analytics 4 → Reports → Realtime
2. [ ] Open app in separate browser window

#### Event Tracking:
3. [ ] **Sign Up Event:**
   - [ ] Sign up with new account
   - [ ] Check GA4 Realtime → Event count increases
   - [ ] Event name: `sign_up` or similar
4. [ ] **Goal Created Event:**
   - [ ] Create a new goal
   - [ ] Check GA4 Realtime → `goal_created` event fires
5. [ ] **Activity Logged Event:**
   - [ ] Log an activity
   - [ ] Check GA4 Realtime → `activity_logged` event fires
6. [ ] **Upgrade Clicked Event:**
   - [ ] Click "Upgrade" button
   - [ ] Check GA4 Realtime → `upgrade_clicked` event fires
7. [ ] **Checkout Started Event:**
   - [ ] Initiate Stripe checkout
   - [ ] Check GA4 Realtime → `checkout_started` event fires
8. [ ] **Purchase Completed Event:**
   - [ ] Complete test payment
   - [ ] Check GA4 Realtime → `purchase` event fires
   - [ ] Verify revenue amount is correct

#### UTM Tracking:
9. [ ] Navigate to homepage with UTM parameters:
   ```
   https://yourdomain.com/?utm_source=test&utm_medium=qa&utm_campaign=qa_test
   ```
10. [ ] Check GA4 → Realtime → Traffic sources
11. [ ] **Verify:** Source shows as "test", medium as "qa"

**Pass Criteria:**
- [ ] All critical events fire correctly
- [ ] Event parameters are accurate
- [ ] UTM parameters are tracked
- [ ] Purchase revenue is recorded

---

## 🛡️ Vulnerability & Dependency Scan

### Test 23: Dependency Security Scan
**Time Estimate:** 10 minutes  
**Tool:** Snyk or npm audit

#### If using Snyk (Recommended):
1. [ ] Go to [Snyk.io](https://snyk.io/) and sign up
2. [ ] Connect your GitHub repository
3. [ ] Run security scan
4. [ ] **Review Results:**
   - [ ] No critical vulnerabilities
   - [ ] No high-severity issues in production dependencies
5. [ ] Fix critical issues before launch

#### Alternative: npm audit
1. [ ] In project directory, run: `npm audit`
2. [ ] **Review Output:**
   - [ ] No critical vulnerabilities
   - [ ] No high-severity issues
3. [ ] If issues found, run: `npm audit fix`

**Pass Criteria:**
- [ ] Zero critical vulnerabilities
- [ ] High-severity issues addressed or documented
- [ ] Dependencies are up-to-date

---

## 📋 Business & Trust Signal Tests

### Test 24: Legal Pages Verification
**Time Estimate:** 10 minutes

1. [ ] **Privacy Policy (`/privacy`):**
   - [ ] Page loads without errors
   - [ ] Content is comprehensive
   - [ ] Covers data collection, usage, and rights
   - [ ] Contact information is present
   - [ ] Last updated date is current
2. [ ] **Terms of Service (`/terms`):**
   - [ ] Page loads without errors
   - [ ] Covers usage terms, liability, etc.
   - [ ] Contact information is present
   - [ ] Last updated date is current
3. [ ] **Contact Information:**
   - [ ] Support email is visible in footer
   - [ ] Contact page (if separate) works
4. [ ] **Footer Links:**
   - [ ] All footer links work (About, Privacy, Terms, Contact)
   - [ ] Social media links work (if present)

**Pass Criteria:**
- [ ] All legal pages are accessible
- [ ] Content is complete and current
- [ ] Contact information is accurate

---

### Test 25: Trust & Credibility Signals
**Time Estimate:** 5 minutes

1. [ ] **Homepage Trust Signals:**
   - [ ] Clear company/product name
   - [ ] Professional design
   - [ ] Contact information visible
   - [ ] Social proof (testimonials, user count) if applicable
   - [ ] Security badges (if applicable)
2. [ ] **About Page (`/about`):**
   - [ ] Page exists and loads
   - [ ] Story/mission is clear
   - [ ] Founder/team information (if applicable)
3. [ ] **SSL Certificate:**
   - [ ] Padlock icon in browser
   - [ ] Certificate is valid (not expired)
   - [ ] No browser security warnings

**Pass Criteria:**
- [ ] Professional appearance
- [ ] Clear trust signals present
- [ ] SSL certificate valid

---

## 📝 QA Results Tracking

### Test Execution Summary

| Test # | Test Name | Status | Date | Tester | Notes |
|--------|-----------|--------|------|--------|-------|
| 1 | Complete First-Time User Journey (Desktop) | [ ] | ___ | ___ | ___ |
| 2 | Mobile User Journey (iOS Safari) | [ ] | ___ | ___ | ___ |
| 3 | Mobile User Journey (Android Chrome) | [ ] | ___ | ___ | ___ |
| 4 | Invalid Input Handling | [ ] | ___ | ___ | ___ |
| 5 | Network Interruption Simulation | [ ] | ___ | ___ | ___ |
| 6 | Payment Failure Simulation | [ ] | ___ | ___ | ___ |
| 7 | Page Load Speed (Desktop) | [ ] | ___ | ___ | ___ |
| 8 | Page Load Speed (Mobile) | [ ] | ___ | ___ | ___ |
| 9 | Load Testing | [ ] | ___ | ___ | ___ |
| 10 | HTTPS & Security Headers | [ ] | ___ | ___ | ___ |
| 11 | Authentication Security | [ ] | ___ | ___ | ___ |
| 12 | Data Privacy & Console Logs | [ ] | ___ | ___ | ___ |
| 13 | Stripe Security & Webhook Testing | [ ] | ___ | ___ | ___ |
| 14 | First-Time User Test (5 Users) | [ ] | ___ | ___ | ___ |
| 15 | Accessibility Audit | [ ] | ___ | ___ | ___ |
| 16 | Browser Compatibility | [ ] | ___ | ___ | ___ |
| 17 | Device & Viewport Testing | [ ] | ___ | ___ | ___ |
| 18 | Email Deliverability | [ ] | ___ | ___ | ___ |
| 19 | Support & Contact Flow | [ ] | ___ | ___ | ___ |
| 20 | SEO Meta Tags | [ ] | ___ | ___ | ___ |
| 21 | Social Share Preview | [ ] | ___ | ___ | ___ |
| 22 | Analytics Event Tracking | [ ] | ___ | ___ | ___ |
| 23 | Dependency Security Scan | [ ] | ___ | ___ | ___ |
| 24 | Legal Pages Verification | [ ] | ___ | ___ | ___ |
| 25 | Trust & Credibility Signals | [ ] | ___ | ___ | ___ |

---

## 🚨 Critical Issues Log

Use this section to track any blocking issues found during QA:

| Issue # | Severity | Description | Steps to Reproduce | Status | Fixed By |
|---------|----------|-------------|-------------------|--------|----------|
| 1 | Critical | Example: App crashes on sign up | ... | Open | ___ |
| 2 | High | Example: Payment doesn't process | ... | Fixed | ___ |

**Severity Levels:**
- **Critical:** App crashes, data loss, security vulnerability, payment failure
- **High:** Major feature broken, poor performance, accessibility blocker
- **Medium:** Minor feature issue, cosmetic bug, usability problem
- **Low:** Typo, minor visual glitch, enhancement request

---

## ✅ Launch Readiness Checklist

Before launching to production:

### Must-Have (Blockers):
- [ ] Test 1 (Desktop User Journey) passes
- [ ] Test 2 (Mobile iOS Journey) passes
- [ ] Test 3 (Mobile Android Journey) passes
- [ ] Test 4 (Input Validation) passes
- [ ] Test 6 (Payment Failure) passes
- [ ] Test 10 (HTTPS Security) passes
- [ ] Test 11 (Authentication Security) passes
- [ ] Test 13 (Stripe Webhooks) passes
- [ ] Test 18 (Email Deliverability) passes
- [ ] Test 24 (Legal Pages) passes
- [ ] Zero critical bugs

### Should-Have (Not Blockers but Important):
- [ ] Test 7 (Desktop Performance) passes
- [ ] Test 8 (Mobile Performance) passes
- [ ] Test 14 (User Testing) completed
- [ ] Test 15 (Accessibility) score >85
- [ ] Test 16 (Cross-Browser) passes
- [ ] Test 20 (SEO) passes
- [ ] Test 21 (Social Previews) passes
- [ ] Test 22 (Analytics) passes
- [ ] Test 23 (Security Scan) passes

---

## 📞 Post-Launch Monitoring

After launch, monitor these metrics daily for the first week:

### Day 1-7 Checklist:
- [ ] **Error Monitoring:** Check Lovable Cloud logs for 500 errors
- [ ] **Performance:** Monitor page load times (Google Analytics)
- [ ] **Conversion Rate:** Track sign-up → goal creation → upgrade funnel
- [ ] **Payment Success Rate:** Check Stripe dashboard for failed payments
- [ ] **Support Requests:** Respond to all inquiries within 4 hours
- [ ] **User Feedback:** Document common issues or requests
- [ ] **Uptime:** Verify 99.9% uptime (use UptimeRobot or similar)

---

**QA Completed By:** ___________  
**Date:** ___________  
**Launch Approved:** [ ] Yes [ ] No  
**Approved By:** ___________
