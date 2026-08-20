import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";
import { isNativeMobile } from "./lib/platform";
import { initSentry } from "./lib/sentry";
import posthog from "posthog-js";

// Initialize PostHog
posthog.init("phc_LARV0p468D0BoYSBVO8giU7HEyALPke2JlaUNnI6uuy", {
  api_host: "https://us.i.posthog.com",
});
posthog.register({ app_name: "Momentum" });
import { nativeService } from "./services/native.service";
import { ThemeProvider } from "./contexts/ThemeContext";

// Initialize Sentry error tracking
initSentry();

// Register service worker for offline mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed');
    });
  });
}

// Initialize Google Analytics — web only.
// Inside the Capacitor native shell (iOS/Android WebView) we skip GA4 entirely
// so in-app traffic doesn't pollute the momentumfit.app web property.
if (!isNativeMobile()) {
  initGA();
}

// Initialize native features
nativeService.initialize();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
