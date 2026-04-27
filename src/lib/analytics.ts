// Google Analytics 4 integration
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Fire-and-forget DB mirror for product events.
// Writes to public.analytics_events (insert-only, RLS: users insert own; admins read all).
// Never throws and never blocks the caller — analytics must not break user flows.
async function recordEvent(
  event_name: string,
  fields: { gate?: string; tier?: string; variant?: string; metadata?: Record<string, unknown> } = {},
) {
  try {
    if (typeof window === "undefined") return;
    const { data: { user } } = await supabase.auth.getUser();
    const row = {
      user_id: user?.id ?? undefined,
      event_name,
      gate: fields.gate ?? undefined,
      tier: fields.tier ?? undefined,
      variant: fields.variant ?? undefined,
      metadata: (fields.metadata ?? {}) as Record<string, unknown>,
    };
    await supabase.from("analytics_events").insert(row);
  } catch {
    // Swallow — analytics is best-effort.
  }
}

export const GA_MEASUREMENT_ID = 'G-DP3CLJWDZB';

// Session-level dedup guards
const _firedEvents = new Set<string>();

function fireOnce(key: string, fn: () => void) {
  if (_firedEvents.has(key)) return;
  _firedEvents.add(key);
  fn();
}

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      page_path: window.location.pathname,
    });
  `;
  document.head.appendChild(script2);
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window.gtag === 'undefined') return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
};

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag === 'undefined') return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Predefined tracking events
export const analytics = {
  // User events
  signup: () => trackEvent('sign_up', 'engagement'),
  login: () => trackEvent('login', 'engagement'),
  
  // Goal events
  goalCreated: () => trackEvent('goal_created', 'goals'),
  goalCompleted: (streak: number) => trackEvent('goal_completed', 'goals', 'streak', streak),
  goalEdited: () => trackEvent('goal_edited', 'goals'),
  goalDeleted: () => trackEvent('goal_deleted', 'goals'),
  
  // Premium events
  upgradeClicked: () => trackEvent('upgrade_clicked', 'conversion'),
  checkoutStarted: () => trackEvent('begin_checkout', 'conversion'),
  purchaseCompleted: (value: number) => trackEvent('purchase', 'conversion', 'premium', value),

  // Upgrade wall funnel — gate funnel measurement.
  // `gate` identifies which feature triggered the wall (coach, streak_repair,
  // habit_limit, partner_lock, analytics_lock, history_limit).
  // `tier` is the tier the wall is selling (pro | premium | unknown).
  // Together they let you build per-gate conversion funnels:
  //   shown? -> dismissed? -> cta_clicked? -> begin_checkout? -> purchase?
  // We pass the GA4 `event_label` as "<gate>:<tier>" so legacy GA reports
  // remain readable, and also push a structured payload via gtag's third arg.
  upgradeWallDismissed: (gate: string, tier: string, method?: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'upgrade_wall_dismissed', {
        event_category: 'conversion',
        event_label: `${gate}:${tier}`,
        gate,
        tier,
        method,
      });
    }
    void recordEvent('upgrade_wall_dismissed', { gate, tier, metadata: method ? { method } : {} });
  },
  upgradeWallCtaClicked: (gate: string, tier: string, method?: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'upgrade_wall_cta_clicked', {
        event_category: 'conversion',
        event_label: `${gate}:${tier}`,
        gate,
        tier,
        method,
      });
    }
    void recordEvent('upgrade_wall_cta_clicked', { gate, tier, metadata: method ? { method } : {} });
  },

  // Fired exactly once per UpgradeWall mount, before any user interaction.
  // `variant` lets us split the funnel by render path:
  //   - 'web'             — standard upgrade modal (web + Android Capacitor)
  //   - 'ios_fallback'    — App-Review-safe inform-only modal on iOS native
  //   - 'entitled_manage' — pre-check fired: user is already Pro/Premium so
  //                         we show Reader-rule "manage your subscription"
  //                         content instead of the upsell.
  upgradeWallShown: (
    gate: string,
    tier: string,
    variant: 'web' | 'ios_fallback' | 'entitled_manage',
  ) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'upgrade_wall_shown', {
        event_category: 'conversion',
        event_label: `${gate}:${tier}:${variant}`,
        gate,
        tier,
        variant,
      });
    }
    void recordEvent('upgrade_wall_shown', { gate, tier, variant });
  },

  // Regression alarm. UpgradeWall on iOS native MUST never render null —
  // doing so would silently strand a user who tapped a gated feature. This
  // event fires from a runtime guard so we get a number to alert on (not
  // just a stack trace) if a future refactor breaks the contract.
  // `reason` is a short machine tag: 'ios_branch_returned_null',
  // 'fallback_threw', 'platform_unknown', etc.
  upgradeWallNullReturn: (gate: string, tier: string, reason: string) => {
    if (typeof window.gtag === 'undefined') return;
    window.gtag('event', 'upgrade_wall_null_return', {
      event_category: 'reliability',
      event_label: `${gate}:${tier}:${reason}`,
      gate,
      tier,
      reason,
    });
  },

  // Engagement events
  streakMilestone: (days: number) => trackEvent('streak_milestone', 'engagement', `${days}_days`, days),
  coachChatOpened: () => trackEvent('coach_chat_opened', 'engagement'),
  coachMessageSent: () => trackEvent('coach_message_sent', 'engagement'),

  // Product-led growth events (with dedup guards where needed)
  visitLanding: () => fireOnce('visit_landing', () => trackEvent('momentum_visit_landing', 'acquisition')),
  startSignup: () => fireOnce('start_signup', () => trackEvent('momentum_start_signup', 'acquisition')),
  completeSignup: () => fireOnce('complete_signup', () => trackEvent('momentum_complete_signup', 'acquisition')),
  startCheckout: (tier: string) => trackEvent('momentum_start_checkout', 'conversion', tier),
  checkoutSuccess: () => fireOnce('checkout_success', () => trackEvent('momentum_checkout_success', 'conversion')),
  activation: () => fireOnce('activation', () => trackEvent('momentum_activation', 'activation', 'first_habit_and_checkin')),
};
