import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, BookOpen, Activity, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/dashboard", label: "Today", icon: Calendar },
  { path: "/library", label: "Library", icon: BookOpen },
  { path: "/track", label: "Track", icon: Activity },
  { path: "/coach", label: "Coach", icon: MessageCircle },
  { path: "/settings", label: "Profile", icon: User },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on authenticated app pages
  const showOnPaths = ["/dashboard", "/library", "/track", "/coach", "/settings", "/goal", "/progress", "/account"];
  const shouldShow = showOnPaths.some(p => location.pathname.startsWith(p));
  if (!shouldShow) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom"
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
