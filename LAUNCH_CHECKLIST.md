# 🚀 Momentum - Pre-Launch Completion Checklist

## ✅ COMPLETED FEATURES

### 1. Legal & Compliance Pages
- [x] Privacy Policy at `/privacy`
- [x] Terms of Service at `/terms`
- [x] Footer links to legal pages
- [x] Contact email provided
- [x] Cookie consent banner (GDPR compliant)

### 2. Stripe Payment Pages
- [x] Success page at `/success`
- [x] Cancel page at `/cancel`
- [x] Payment tracking with analytics
- [x] Premium activation verification

### 3. User Experience Enhancements
- [x] Enhanced empty state on Dashboard
- [x] Welcome onboarding page for new users
- [x] Error boundary for crash recovery
- [x] Data export functionality
- [x] Account deletion option
- [x] Email display fixed in Settings

### 4. Analytics & Tracking
- [x] Google Analytics 4 integration
- [x] Event tracking for key actions:
  - Signup/Login
  - Goal creation/completion
  - Streak milestones
  - Upgrade clicks
  - Checkout started
  - Purchase completed
  - Coach chat interactions
- [x] Cookie consent integration with GA4
- [x] Consent mode implementation

### 5. SEO Optimizations
- [x] Meta tags and descriptions
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Canonical URLs
- [x] Theme color meta tag

---

## 🔧 MANUAL CONFIGURATION REQUIRED

### Step 1: Update Analytics ID
**File:** `src/lib/analytics.ts`
```typescript
// Line 9: Replace with your actual Google Analytics ID
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <- UPDATE THIS
```

### Step 2: Update Domain URLs
Replace `yourdomain.com` in these files:
- `index.html` (line 8 - canonical URL)
- `public/robots.txt` (line 3 - sitemap URL)
- `public/sitemap.xml` (all URLs)

### Step 3: Update Support Email
Replace `support@momentum-app.com` in:
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Success.tsx`
- `src/pages/Cancel.tsx`
- `src/pages/Welcome.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/pages/Index.tsx` (footer)

### Step 4: Update Social Media Handles
**File:** `index.html` (line 22)
```html
<meta name="twitter:site" content="@momentum_app" /> <!-- UPDATE THIS -->
```

### Step 5: Replace Placeholder Images
- Update OpenGraph image URL in `index.html` (lines 19, 23)
- Upload actual preview image for social sharing

### Step 6: Stripe Configuration
1. **Test Mode First:**
   - Use Stripe test keys
   - Test checkout flow with card: `4242 4242 4242 4242`
   - Verify webhook events

2. **Configure Webhook:**
   - Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret to Supabase secrets

3. **Switch to Live Mode:**
   - Update Stripe keys in Supabase secrets
   - Do ONE test purchase
   - Verify premium activation

### Step 7: Supabase Configuration
- Enable email auto-confirm in Auth settings
- Set Site URL to your domain
- Add redirect URLs (deployed URL + preview URL)
- Verify RLS policies are enabled

### Step 8: Domain Setup via Lovable
- Go to Project → Settings → Domains
- Add your custom domain
- Update DNS records as instructed
- Wait for SSL certificate provisioning

---

## ✅ TESTING CHECKLIST

### Core User Flow (Complete This Sequence)
1. [ ] Visit homepage → Clear CTA visible
2. [ ] Click "Sign Up"
3. [ ] Create account with valid email
4. [ ] See welcome onboarding page
5. [ ] Navigate to dashboard
6. [ ] See empty state with clear CTA
7. [ ] Create 1st goal → Success
8. [ ] Log activity → Streak increments
9. [ ] Create 2nd goal → Success
10. [ ] Create 3rd goal → Success
11. [ ] Try 4th goal → Paywall appears
12. [ ] Click "Upgrade" → Pricing page
13. [ ] Click upgrade → Stripe checkout (TEST MODE)
14. [ ] Complete payment (test card)
15. [ ] Redirect to success page
16. [ ] Return to dashboard → Premium active
17. [ ] Create 4th goal → Success
18. [ ] Open AI Coach chat → Works
19. [ ] Go to Settings → Manage subscription
20. [ ] Export data → JSON downloads
21. [ ] Sign out → Redirects to home
22. [ ] Sign in → All data persists

### Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] All buttons tappable (min 44px)
- [ ] Text readable without zoom
- [ ] No horizontal scroll
- [ ] Forms easy to use

### Browser Testing
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

### Payment Testing
- [ ] Monthly subscription checkout works
- [ ] Annual subscription checkout works (if available)
- [ ] Payment failure handled gracefully
- [ ] Webhook updates premium status
- [ ] Subscription cancellation works
- [ ] Customer portal accessible

### Legal Pages
- [ ] Privacy policy accessible
- [ ] Terms accessible
- [ ] Cookie banner appears
- [ ] Accept cookies → GA tracks
- [ ] Decline cookies → GA disabled

### Error Handling
- [ ] Force error → Error boundary shows
- [ ] Reload button works
- [ ] Dashboard button works
- [ ] Network error handled
- [ ] Invalid form submission prevented

---

## 🚨 CRITICAL ISSUES TO CHECK

**DO NOT LAUNCH IF:**
- [ ] ❌ Stripe payments not working
- [ ] ❌ Webhook not receiving events
- [ ] ❌ Users can bypass paywall
- [ ] ❌ Data loss on page refresh
- [ ] ❌ App crashes on mobile
- [ ] ❌ SSL not working (not https)
- [ ] ❌ No privacy policy

---

## 📊 Analytics Verification

After launching:
1. [ ] GA4 dashboard receiving data
2. [ ] Custom events appearing
3. [ ] Conversion tracking working
4. [ ] Real-time users showing

---

## 🎯 LAUNCH DAY CHECKLIST

### Pre-Launch (1 hour before)
- [ ] Switch Stripe to LIVE mode
- [ ] Update all domain references
- [ ] Clear test data from database
- [ ] Verify email sending works
- [ ] Test one real payment (then refund)

### Launch
- [ ] Publish via Lovable
- [ ] Verify custom domain works
- [ ] Check SSL certificate
- [ ] Post on Product Hunt (12:01am PST Tues-Thu)
- [ ] Share on social media
- [ ] Email launch list

### Post-Launch (First 24 hours)
- [ ] Monitor error logs every 2 hours
- [ ] Check Stripe dashboard for payments
- [ ] Watch analytics for user behavior
- [ ] Respond to support emails within 1 hour
- [ ] Reply to EVERY Product Hunt comment

---

## 📧 Support Preparation

### Quick Responses Ready
```
Q: How do I cancel?
A: Go to Settings → Manage Subscription → Cancel anytime

Q: Payment failed
A: Please try another card or contact your bank. Email support@momentum-app.com if the issue persists.

Q: How many goals can I create?
A: Free: 3 goals | Premium: Unlimited

Q: Do you offer refunds?
A: Yes, within 7 days of purchase. Email support@momentum-app.com
```

---

## ✅ READY TO LAUNCH WHEN:

- [x] All "Completed Features" checked
- [ ] All "Manual Configuration" completed
- [ ] All "Core User Flow" tested successfully
- [ ] Stripe in TEST mode verified
- [ ] Support email configured and tested
- [ ] Domain connected and SSL active
- [ ] Legal pages reviewed by you/legal counsel
- [ ] Analytics tracking verified

---

## 🎉 POST-LAUNCH

### Week 1 Goals
- 50+ signups
- 5+ premium conversions
- No critical bugs
- Top 5 Product of the Day

### Monitor Daily
- User signups
- Premium conversions
- Error rates
- User feedback
- Support requests

---

**When everything is ✅ checked, you're ready to LAUNCH! 🚀**

For questions: support@momentum-app.com