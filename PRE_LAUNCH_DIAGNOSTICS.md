# 🧪 Pre-Launch Diagnostics Checklist

## Overview
Complete this diagnostic checklist before submitting your app to any public marketplace (Product Hunt, App Store, directories, etc.). This ensures you catch critical issues before real users experience them.

---

## 1. 🔧 Functional & Reliability Diagnostics

### Core User Flows (Must Pass)
- [ ] **Happy Path Works End-to-End**
  - Sign up → Create goal → Log activity → Upgrade → Sign out → Sign in
  - No errors, no crashes, data persists
- [ ] **Edge Cases Handled**
  - Invalid inputs show clear error messages
  - Network interruptions don't crash app
  - Payment failures are handled gracefully
  - Empty states are useful (not blank)
- [ ] **Cross-Platform Verified**
  - ✅ Desktop: Chrome
  - ✅ Desktop: Safari
  - ✅ Desktop: Firefox
  - ✅ Desktop: Edge
  - ✅ Mobile: iOS Safari
  - ✅ Mobile: Android Chrome
- [ ] **Stress Test Passed**
  - App handles 100+ concurrent users
  - No crashes under load
  - Response times stay reasonable (<3s)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Blocker Issues:** _______________________

---

## 2. 🚀 Performance & Speed Diagnostics

### Page Load Performance
| Page | Desktop Score | Mobile Score | LCP | FID | CLS | Status |
|------|--------------|--------------|-----|-----|-----|--------|
| Homepage | ___ / 100 | ___ / 100 | ___s | ___ms | ___ | [ ] |
| Dashboard | ___ / 100 | ___ / 100 | ___s | ___ms | ___ | [ ] |
| Pricing | ___ / 100 | ___ / 100 | ___s | ___ms | ___ | [ ] |

**Targets:**
- Desktop: >90 (homepage), >85 (dashboard)
- Mobile: >85 (homepage), >80 (dashboard)
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1

### Performance Checklist
- [ ] **Page load time** < 3 seconds on 4G connection
- [ ] **Core Web Vitals** all in "Good" range
- [ ] **API response time** < 300ms for critical endpoints
- [ ] **Images optimized** (lazy loading, compressed)
- [ ] **JavaScript bundle size** reasonable (<500KB)
- [ ] **No render-blocking resources** (defer non-critical JS/CSS)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Performance Issues:** _______________________

---

## 3. 🔒 Security & Privacy Diagnostics

### Security Fundamentals
- [ ] **HTTPS Everywhere**
  - All pages served over HTTPS
  - SSL certificate is valid (not expired)
  - No mixed content warnings
- [ ] **Authentication Security**
  - Strong password requirements (8+ chars, uppercase, lowercase, number)
  - Session persistence works correctly
  - Password reset flow functions
  - Sessions expire when cleared
- [ ] **Data Protection**
  - No sensitive data (passwords, tokens) in console logs
  - No API keys exposed in network requests
  - User data encrypted in transit (HTTPS)
  - Personal health data not logged to console
- [ ] **Payment Security**
  - Stripe webhooks configured correctly
  - Test webhooks process successfully
  - Payment failures handled gracefully
  - No payment data stored locally

### Security Headers Present
- [ ] `Strict-Transport-Security`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`

### Vulnerability Scan Results
- [ ] **Dependency scan completed** (Snyk or npm audit)
- [ ] **Zero critical vulnerabilities**
- [ ] **High-severity issues** addressed or documented
- [ ] **Dependencies up-to-date** (no outdated packages >6 months old)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Security Risks:** _______________________

---

## 4. 🎨 User Experience Diagnostics

### First-Time User Testing (5 Users)
| User | Understood App Purpose? | Created Goal? | Would Use? | Top Issue |
|------|------------------------|---------------|------------|-----------|
| 1 | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | ___ |
| 2 | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | ___ |
| 3 | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | ___ |
| 4 | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | ___ |
| 5 | [ ] Yes [ ] No | [ ] Yes [ ] No | [ ] Yes [ ] No | ___ |

**Pass Criteria:** 4/5 users understand purpose, 4/5 create goal, 3/5 would use

### Navigation & Clarity
- [ ] **Value proposition clear** in <5 seconds on homepage
- [ ] **Primary CTA visible** above the fold
- [ ] **Core feature accessible** in <60 seconds
- [ ] **Navigation intuitive** (users don't get lost)
- [ ] **Empty states helpful** (not just blank screens)
- [ ] **Error messages clear** (tell user what to do next)

### Accessibility (WCAG AA Minimum)
- [ ] **Lighthouse Accessibility Score:** ___ / 100 (Target: >90)
- [ ] **Color contrast** meets WCAG AA (4.5:1 for text)
- [ ] **Keyboard navigation** works for all interactive elements
- [ ] **Focus indicators** visible (outline on focused elements)
- [ ] **Alt text** present on all images
- [ ] **Screen reader compatible** (tested with VoiceOver or NVDA)
- [ ] **Form labels** correctly associated with inputs

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**UX Issues:** _______________________

---

## 5. 📱 Marketplace-Specific Readiness

### SEO & Meta Tags
- [ ] **Title tags** optimized (50-60 chars, includes primary keyword)
- [ ] **Meta descriptions** compelling (150-160 chars)
- [ ] **Canonical URLs** set correctly
- [ ] **Robots.txt** configured (allows indexing)
- [ ] **Sitemap.xml** submitted to Google Search Console
- [ ] **Schema.org structured data** implemented (SoftwareApplication)
- [ ] **Lighthouse SEO Score:** ___ / 100 (Target: >90)

### Social Media Previews
- [ ] **Twitter Card**
  - Image displays correctly (1200×675)
  - Title and description accurate
  - Tested on [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] **Open Graph (Facebook)**
  - Image displays correctly (1200×630)
  - Title and description accurate
  - Tested on [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] **LinkedIn Preview**
  - Image displays correctly
  - Tested on [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [ ] **Slack Unfurl**
  - Preview displays correctly when URL pasted

### Visual Assets Ready
- [ ] **App Icon** (512×512 and 1024×1024)
- [ ] **Favicon** (16×16, 32×32, 64×64)
- [ ] **OG Image** (1200×630)
- [ ] **Twitter Card Image** (1200×675)
- [ ] **Screenshots** (4-6 high-quality images, 16:9 ratio)
- [ ] **Demo Video** (30-60 seconds)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Marketplace Issues:** _______________________

---

## 6. 📧 Email & Communication Diagnostics

### Email Deliverability
- [ ] **Welcome email** arrives within 2 minutes
- [ ] **Password reset email** arrives within 1 minute
- [ ] **Transactional emails** render correctly (text + images)
- [ ] **Email links work** (no broken URLs)
- [ ] **Spam score** >7/10 on [mail-tester.com](https://www.mail-tester.com/)
- [ ] **SPF/DKIM/DMARC** configured correctly

### Support Flow
- [ ] **Contact form** submits successfully
- [ ] **Support email** receives submissions
- [ ] **Confirmation email** sent to user
- [ ] **Response time commitment** clear (e.g., "We respond within 24 hours")

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Communication Issues:** _______________________

---

## 7. 📊 Analytics & Tracking Diagnostics

### Event Tracking Verified
- [ ] **Sign up event** fires correctly
- [ ] **Goal created event** fires correctly
- [ ] **Activity logged event** fires correctly
- [ ] **Upgrade clicked event** fires correctly
- [ ] **Checkout started event** fires correctly
- [ ] **Purchase completed event** fires correctly (with revenue)
- [ ] **UTM parameters** tracked correctly

### Analytics Configuration
- [ ] **Google Analytics 4** configured
- [ ] **Real-time events** showing in GA4
- [ ] **Conversion goals** set up
- [ ] **E-commerce tracking** enabled (if applicable)
- [ ] **Cookie consent** implemented (GDPR compliance)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Tracking Issues:** _______________________

---

## 8. 🏢 Business & Trust Signals

### Legal Compliance
- [ ] **Privacy Policy** page exists and is comprehensive
- [ ] **Terms of Service** page exists and is comprehensive
- [ ] **Cookie Policy** present (if EU traffic expected)
- [ ] **Contact information** visible (email, address if applicable)
- [ ] **Last updated dates** current on legal pages
- [ ] **GDPR compliance** implemented (if EU traffic expected)
- [ ] **CCPA compliance** considered (if CA traffic expected)

### Trust & Credibility
- [ ] **Professional design** (no obvious template look)
- [ ] **Clear company/product name** and branding
- [ ] **About page** tells your story/mission
- [ ] **Social proof** displayed (testimonials, user count, reviews)
- [ ] **Security badges** (if applicable - payment, certifications)
- [ ] **SSL certificate** valid and visible (padlock icon)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Trust Issues:** _______________________

---

## 9. 💳 Payment System Diagnostics (If Applicable)

### Stripe Integration
- [ ] **Test mode verified** (successful test purchases)
- [ ] **Live mode tested** (ONE real purchase, then refunded)
- [ ] **Webhook events** configured correctly:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] **Webhook endpoint** working (events received and processed)
- [ ] **Failed payments** handled gracefully
- [ ] **Refund process** tested and working
- [ ] **Customer Portal** accessible and functional

### Payment Flow
- [ ] **Checkout initiates** without errors
- [ ] **Customer email** pre-filled in Stripe Checkout
- [ ] **Success URL** redirects correctly
- [ ] **Cancel URL** redirects correctly
- [ ] **Premium access** granted after successful payment
- [ ] **Subscription status** persists across sessions

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Payment Issues:** _______________________

---

## 10. 🎯 Platform-Specific Launch Checks

### Product Hunt Readiness
- [ ] **Tagline** clear and compelling (5-10 words)
- [ ] **150-word description** written
- [ ] **Maker comment** prepared (200-300 words)
- [ ] **Gallery images** ready (4-6 images)
- [ ] **Demo video** uploaded or linked
- [ ] **Hunter confirmed** (if not self-hunting)
- [ ] **Launch date/time** scheduled (12:01 AM PST Tues-Thurs)

### Hacker News Readiness
- [ ] **Show HN title** prepared (Show HN: [Name] – [Tagline])
- [ ] **Technical depth comment** written (architecture, tech stack)
- [ ] **Questions for HN community** prepared

### Reddit Readiness
- [ ] **Subreddit-specific posts** written (r/SideProject, r/fitness30plus)
- [ ] **Posts follow subreddit rules** (not overly promotional)
- [ ] **Engagement plan** ready (respond to all comments)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested  
**Platform Issues:** _______________________

---

## 📋 Critical Blockers (Must Pass Before Launch)

These issues MUST be resolved before public launch:

- [ ] **App doesn't crash** during core user journey
- [ ] **Payment processing works** end-to-end
- [ ] **HTTPS/SSL** properly configured
- [ ] **Authentication secure** (no token leaks, session works)
- [ ] **Mobile responsive** (usable on iOS and Android)
- [ ] **Privacy Policy** and **Terms of Service** published
- [ ] **Support email** working and monitored
- [ ] **No critical security vulnerabilities**
- [ ] **Analytics tracking** functional
- [ ] **Social media previews** render correctly

**All Critical Blockers Resolved:** [ ] Yes [ ] No

---

## ✅ Launch Decision

### Pre-Launch Approval

**QA Completed By:** ___________  
**Date:** ___________  
**Total Tests Passed:** ___ / 25  
**Critical Issues:** ___ (Must be 0)  
**High-Priority Issues:** ___  

### Launch Recommendation:

- [ ] **READY TO LAUNCH** - All critical checks passed, minor issues documented
- [ ] **LAUNCH WITH CAUTION** - Some non-critical issues remain, but acceptable
- [ ] **DO NOT LAUNCH** - Critical blockers present, must be fixed first

**Approved By:** ___________  
**Launch Date:** ___________

---

## 📊 Post-Launch Monitoring Plan

After launch, monitor these daily for the first week:

### Day 1-7 Checklist:
- [ ] Check error logs (Lovable Cloud → Backend → Edge Function Logs)
- [ ] Monitor uptime (UptimeRobot or similar)
- [ ] Track conversion funnel (sign-up → goal → upgrade)
- [ ] Check payment success rate (Stripe Dashboard)
- [ ] Respond to support requests within 4 hours
- [ ] Document user feedback and feature requests
- [ ] Monitor Performance (Core Web Vitals in GA4)

### Key Metrics to Track:
- **Uptime:** Target 99.9%
- **Page Load Time:** <3s
- **Sign-up Conversion Rate:** ___%
- **Upgrade Conversion Rate:** ___%
- **Payment Success Rate:** >95%
- **Support Response Time:** <4 hours

---

## 🚨 Emergency Response Plan

If a critical issue is discovered post-launch:

1. **Assess Severity:**
   - Critical: Data loss, security breach, payment failure, site down
   - High: Major feature broken, widespread errors
   - Medium: Minor feature issue, cosmetic bug

2. **Immediate Actions (Critical Issues):**
   - [ ] Post notice on homepage/social media
   - [ ] Pause paid advertising (if running)
   - [ ] Fix issue or rollback to previous version
   - [ ] Notify affected users
   - [ ] Document issue and resolution

3. **Communication Plan:**
   - **Twitter:** "We're aware of [issue] and working on a fix. ETA: [time]"
   - **Email:** Send to affected users with timeline and resolution
   - **Product Hunt:** Post update in comments

---

**Diagnostic Completed:** [ ] Yes [ ] No  
**Launch Approved:** [ ] Yes [ ] No  
**Next Steps:** _______________________
