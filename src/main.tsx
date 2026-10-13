import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativeMobile } from "./lib/platform";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy-init Sentry after first render
import("./lib/sentry").then(({ initSentry }) => initSentry());

// Defer PostHog init to after first idle or ~4s
function deferPostHog() {
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init("phc_LARV0p468D0BoYSBVO8giU7HEyALPke2JlaUNnI6uuy", {
      api_host: "https://us.i.posthog.com",
    });
    posthog.register({ app_name: "Momentum" });
  });
}
if ("requestIdleCallback" in window) {
  requestIdleCallback(deferPostHog, { timeout: 4000 });
} else {
  setTimeout(deferPostHog, 1);
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
