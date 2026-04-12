import { useLocation } from "react-router-dom";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const appPaths = ["/dashboard", "/library", "/insights", "/track", "/coach", "/settings", "/goal", "/progress", "/account", "/pricing", "/profile", "/admin"];
  const isAppRoute = appPaths.some(p => location.pathname.startsWith(p));

  return (
    <div className={isAppRoute ? "md:ml-[200px]" : ""}>
      {children}
    </div>
  );
}