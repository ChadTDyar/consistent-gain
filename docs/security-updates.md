# Momentum Security Audit & Remediation Plan

Generated: 2026-04-02

## Summary

Security scan identified **2 critical** and **3 warning-level** findings. Critical issues have been resolved via database migration. Warnings require either manual configuration or are informational.

---

## Phase 1: Critical (✅ RESOLVED)

### 1. Open INSERT on `coach_triggers`
- **Vulnerability**: The `"Service role can insert triggers"` policy used `WITH CHECK (true)` on `{public}`, allowing any unauthenticated user to insert coach triggers for arbitrary user IDs.
- **Fix**: Replaced with `"Users can insert own triggers"` policy scoped to `authenticated` role with `WITH CHECK (auth.uid() = user_id)`.
- **Verification**: Attempt `supabase.from('coach_triggers').insert({user_id: '<other-user>', trigger_type: 'test'})` — should return RLS error.

### 2. Testimonial self-approval bypass
- **Vulnerability**: Users could update `is_approved = true` on their own testimonials, bypassing admin moderation.
- **Fix**: Updated `WITH CHECK` condition to enforce `is_approved = false` for user-owned updates. Only admins can set `is_approved = true`.
- **Verification**: Attempt updating own testimonial with `is_approved: true` — should fail.

---

## Phase 2: High (⚠️ MANUAL ACTION REQUIRED)

### 3. Leaked Password Protection (HIBP Check)
- **Issue**: Password breach checking is disabled — users can sign up with known compromised passwords.
- **Fix**: Enable in **Cloud → Users → Auth Settings (gear icon) → Email settings → Password HIBP Check**.
- **Status**: Requires manual toggle in the Lovable Cloud UI.

---

## Phase 3: Medium (Informational)

### 4. `stripe_customers` table has no user-facing RLS policy
- **Current state**: Only `service_role` has access. This is intentional — Stripe IDs are sensitive and should not be exposed to client-side queries.
- **Risk**: Low. The table is inaccessible to all non-service-role queries. No action needed unless user-facing subscription data is required (use `profiles.subscription_status` instead).
- **Status**: Accepted risk. Architecture is correct per PCI best practices.

### 5. `handle_new_user` search_path style
- **Issue**: Minor style difference between `SET search_path = public` (identifier) vs `SET search_path = 'public'` (string literal).
- **Status**: Ignored. Both are secure when hardcoded. No exploitation vector.

### 6. Google Analytics ID in client code
- **Issue**: GA Measurement ID hardcoded in `src/lib/analytics.ts`.
- **Status**: Expected behavior. GA IDs are designed to be public.

---

## Existing Security Controls (Already Correct)

| Control | Status |
|---------|--------|
| RLS enabled on all public tables | ✅ |
| `has_role()` SECURITY DEFINER function for admin checks | ✅ |
| `prevent_subscription_status_updates` trigger blocks client-side premium manipulation | ✅ |
| Stripe data isolated in admin-only table | ✅ |
| JWT verification on sensitive edge functions | ✅ |
| DOMPurify sanitization for blog HTML | ✅ |
| User can only CRUD own data (activity_logs, goals, pain_reports, etc.) | ✅ |
| Admin RLS policies use `has_role()` not client-side checks | ✅ |
| `activity_logs` UPDATE blocked globally (append-only pattern) | ✅ |

---

## Post-Remediation Checklist

- [x] Coach triggers INSERT policy restricted to authenticated + own user_id
- [x] Testimonial self-approval blocked
- [ ] Enable HIBP password check (manual)
- [ ] Re-run security scan to confirm 0 critical/error findings
