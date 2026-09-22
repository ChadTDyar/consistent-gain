import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router-dom") ||
              /[\\/]node_modules[\\/]react[\\/]/.test(id)
            ) {
              return "vendor";
            }
            if (
              id.includes("node_modules/@radix-ui/react-dialog") ||
              id.includes("node_modules/@radix-ui/react-tooltip") ||
              id.includes("node_modules/@radix-ui/react-popover")
            ) {
              return "ui";
            }
            if (id.includes("node_modules/recharts")) {
              return "charts";
            }
            return undefined;
          }

          // Group the below-the-fold landing page sections into a single
          // chunk so they load as one request on scroll/interaction instead
          // of one separate request per component.
          const belowFoldLandingSections = [
            "src/components/StreakRepairDemo",
            "src/components/DifferentiationCallout",
            "src/components/ProductShowcase",
            "src/components/DemoPreview",
            "src/components/NotificationExplainer",
            "src/components/Testimonials",
            "src/components/LandingPricing",
            "src/components/ComparisonTable",
            "src/components/FAQ",
          ];
          if (belowFoldLandingSections.some((section) => id.includes(section))) {
            return "landing-below-fold";
          }

          return undefined;
        },
      },
    },
    target: "es2020",
    cssCodeSplit: true,
  },
}));
