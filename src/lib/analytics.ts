// Google Analytics 4 integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-DP3CLJWDZB';

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
  
  // Engagement events
  streakMilestone: (days: number) => trackEvent('streak_milestone', 'engagement', `${days}_days`, days),
  coachChatOpened: () => trackEvent('coach_chat_opened', 'engagement'),
  coachMessageSent: () => trackEvent('coach_message_sent', 'engagement'),

  // Product-led growth events
  visitLanding: () => trackEvent('momentum_visit_landing', 'acquisition'),
  startSignup: () => trackEvent('momentum_start_signup', 'acquisition'),
  completeSignup: () => trackEvent('momentum_complete_signup', 'acquisition'),
  startCheckout: () => trackEvent('momentum_start_checkout', 'conversion'),
  checkoutSuccess: () => trackEvent('momentum_checkout_success', 'conversion'),
  activation: () => trackEvent('momentum_activation', 'activation', 'first_habit_and_checkin'),
};
