// PostHog loads only after the visitor accepts the cookie banner.
// Before that, nothing is initialized: no capture, no recorder, no requests to PostHog.
// Calls like posthog.capture() elsewhere are no-ops until initPostHog() runs.

export const COOKIE_CONSENT_KEY = "momentum-cookie-consent";

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

let started = false;

export function initPostHog() {
  if (started) return;
  started = true;
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init("phc_LARV0p468D0BoYSBVO8giU7HEyALPke2JlaUNnI6uuy", {
      api_host: "https://us.i.posthog.com",
    });
    posthog.register({ app_name: "Momentum" });
  });
}
