import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativeMobile } from "./lib/platform";
import { ThemeProvider } from "./contexts/ThemeContext";
import { hasAnalyticsConsent, initPostHog } from "./lib/posthog";

// Lazy-init Sentry after first render
import("./lib/sentry").then(({ initSentry }) => initSentry());

// PostHog: opt-out by default. Nothing loads from PostHog until the visitor
// accepts the cookie banner (CookieConsent calls window.loadPostHog).
// Returning visitors who already accepted load after first idle or ~4s.
window.loadPostHog = initPostHog;
if (hasAnalyticsConsent()) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initPostHog, { timeout: 4000 });
  } else {
    setTimeout(initPostHog, 1);
  }
}

// Register service worker for offline mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed');
    });
  });
}

// Initialize Google Analytics — web only.
if (!isNativeMobile()) {
  import("./lib/analytics").then(({ initGA }) => initGA());
}

// Lazy-init native features
import("./services/native.service").then(({ nativeService }) => {
  nativeService.initialize();
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
