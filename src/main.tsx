import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";
import { nativeService } from "./services/native.service";
import { ThemeProvider } from "./contexts/ThemeContext";

// Register service worker for offline mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed');
    });
  });
}

// Initialize Google Analytics
initGA();

// Initialize native features
nativeService.initialize();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
