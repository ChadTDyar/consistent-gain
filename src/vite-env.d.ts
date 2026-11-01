/// <reference types="vite/client" />

interface Window {
  /** Loads PostHog after cookie consent (src/lib/posthog.ts). */
  loadPostHog?: () => void;
}
