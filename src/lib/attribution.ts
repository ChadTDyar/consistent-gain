export const ATTRIBUTION_KEY = 'arl_attr';

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string;
}

/** Store first-landing UTM values + path once per session; later loads keep the first value. */
export function captureAttribution(): void {
  try {
    if (typeof window === 'undefined' || sessionStorage.getItem(ATTRIBUTION_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const attr: Attribution = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      landing_path: window.location.pathname,
    };
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attr));
  } catch {
    // Storage unavailable (private mode etc.): attribution is best-effort.
  }
}

export function readAttribution(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
