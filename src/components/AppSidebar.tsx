import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, TrendingUp, Activity, MessageCircle, User, Lock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type PlanTier } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanTier>("free");

  useEffect(() => {
    const loadPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
      if (data?.plan) setPlan(data.plan as PlanTier);
    };
    loadPlan();
  }, []);

  const showOnPaths = ["/dashboard", "/library", "/insights", "/track", "/coach", "/settings", "/goal", "/progress", "/account", "/pricing", "/profile"];
  const shouldShow = showOnPaths.some(p => location.pathname.startsWith(p));
  if (!shouldShow) return null;

  const isPremium = plan === 'pro';
  const isPro = plan === 'plus' || plan === 'pro';

  const items = [
    { path: "/dashboard", label: "Today", icon: Calendar, locked: false },
    { path: "/insights", label: "Insights", icon: TrendingUp, locked: !isPro, lockLabel: "Pro" },
    { path: "/track", label: "Track", icon: Activity, locked: false },
    { path: "/coach", label: "Coach", icon: MessageCircle, locked: !isPremium, lockLabel: "Premium" },
    { path: "/profile", label: "Profile", icon: User, locked: false },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[200px] bg-card border-r border-border z-40 py-6 px-3">
      <div className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/dashboard" && location.pathname.startsWith("/goal"));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.locked && (
                <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0 flex items-center gap-0.5">
                  <Lock className="h-2.5 w-2.5" />
                  {item.lockLabel}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {plan !== 'pro' && (
        <Button
          onClick={() => navigate("/pricing")}
          className="w-full mt-4 font-semibold"
          style={{ background: '#0d3b5e' }}
        >
          Upgrade
        </Button>
      )}
    </aside>
  );
}