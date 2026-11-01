import { useLocation } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const authStatus = useAuthStatus();

  const appPaths = ["/dashboard", "/library", "/insights", "/track", "/coach", "/settings", "/goal", "/progress", "/account", "/pricing", "/profile", "/admin"];
  // /pricing is public: only reserve sidebar space there once a session is confirmed.
  const isPricing = location.pathname.startsWith("/pricing");
  const isAppRoute = appPaths.some(p => location.pathname.startsWith(p)) && (!isPricing || authStatus === "signed_in");

  return (
    <div className={isAppRoute ? "md:ml-[200px]" : ""}>
      {/* WCAG 2.4.1 Bypass Blocks — every route's content is wrapped in a
          landmark <main> with id="main-content" so the global skip-link in
          App.tsx can jump keyboard users past the sidebar/header. */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </div>
  );
}
