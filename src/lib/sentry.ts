import * as Sentry from "@sentry/capacitor";
import * as SentryReact from "@sentry/react";

// Prefer Momentum-specific DSN; fall back to legacy DSN to preserve continuity
// of error capture during the v1.0 -> v1.1 transition.
const FALLBACK_DSN =
  "https://3efd7796cdd37012d6e76a1d97ecbd81@o4511116720472064.ingest.us.sentry.io/4511117719502848";

export function initSentry() {
  const dsn =
    import.meta.env.VITE_SENTRY_DSN_MOMENTUM ||
    import.meta.env.VITE_SENTRY_DSN ||
    FALLBACK_DSN;

  if (!dsn) return;

  Sentry.init(
    {
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      integrations: [SentryReact.browserTracingIntegration()],
    },
    SentryReact.init
  );
}

export { Sentry, SentryReact };
