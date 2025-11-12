import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from "./lib/analytics";
import { nativeService } from "./services/native.service";
import { ThemeProvider } from "./contexts/ThemeContext";

// Initialize Google Analytics
initGA();

// Initialize native features
nativeService.initialize();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
