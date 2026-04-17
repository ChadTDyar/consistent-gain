import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, Activity, MessageCircle, TrendingUp, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/dashboard", label: "Habits", icon: Calendar },
  { path: "/insights", label: "Trends", icon: TrendingUp },
  { path: "/track", label: "Track", icon: Activity },
  { path: "/coach", label: "Coach", icon: MessageCircle },
  { path: "/settings", label: "Menu", icon: Menu },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on authenticated app pages, hide on desktop (md+)
  const showOnPaths = ["/dashboard", "/library", "/insights", "/track", "/coach", "/settings", "/goal", "/progress", "/account", "/pricing", "/profile"];
  const shouldShow = showOnPaths.some(p => location.pathname.startsWith(p));
  if (!shouldShow) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom safe-area-x md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path === "/dashboard" && location.pathname.startsWith("/goal"));
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[44px] transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={isActive ? { color: '#0d3b5e' } : undefined}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
