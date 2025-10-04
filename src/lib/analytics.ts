// Google Analytics 4 integration

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ⚠️ REQUIRED BEFORE LAUNCH: Update with your actual Google Analytics 4 Measurement ID
// 
// How to get your GA4 ID:
// 1. Go to https://analytics.google.com
// 2. Create a new property (or use existing)
// 3. Navigate to Admin → Data Streams → Web
// 4. Copy the Measurement ID (format: G-XXXXXXXXXX)
// 5. Replace the value below
//
// Without a valid GA4 ID, no analytics data will be tracked!
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // 🚨 REPLACE THIS BEFORE LAUNCH 🚨

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
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
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
};