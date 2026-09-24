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
        // DO NOT re-split third-party code. All node_modules must stay in the
        // single "vendor" chunk. Splitting any package into a chunk separate
        // from React can create a circular ESM chunk dependency that only
        // crashes in the real production bundle (not the dev sandbox); this
        // caused a P1 white-screen outage. Enforced at build time by
        // scripts/check-manual-chunks.mjs (runs as "prebuild").
        manualChunks(id) {
          // Vite's lazy-load helper is shared by vendor and app code; keep it
          // in vendor so it cannot create a vendor <-> app chunk cycle.
          if (id.includes("vite/preload-helper")) {
            return "vendor";
          }
          if (id.includes("node_modules")) {
            // All third-party code, including Radix UI, stays in one vendor
            // chunk. Splitting shared Radix pieces into "ui" created a
            // vendor <-> ui cycle in production.
            if (
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router-dom") ||
              /[\\/]node_modules[\\/]react[\\/]/.test(id)
            ) {
              return "vendor";
            }
            // Keep recharts and its runtime dependency tree in the same chunk
            // as React. A separate charts chunk created a vendor <-> charts
            // ESM cycle where recharts called React.forwardRef before its
            // React binding initialized, blanking the app in production.
            const chartsTreeMatchers = [
              "node_modules/recharts",
              "node_modules/lodash",
              "node_modules/d3-shape",
              "node_modules/d3-scale",
              "node_modules/d3-interpolate",
              "node_modules/d3-array",
              "node_modules/d3-time",
              "node_modules/d3-time-format",
              "node_modules/d3-color",
              "node_modules/d3-format",
              "node_modules/d3-path",
              "node_modules/victory-vendor",
              "node_modules/decimal.js-light",
              "node_modules/eventemitter3",
              "node_modules/recharts-scale",
              "node_modules/tiny-invariant",
              "node_modules/fast-equals",
            ];
            if (chartsTreeMatchers.some((m) => id.includes(m))) {
              return "vendor";
            }
            // Never let shared third-party code fall into an app chunk such
            // as landing-below-fold; that creates vendor <-> app cycles.
            return "vendor";
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
