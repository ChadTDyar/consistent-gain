import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CoachChat } from "@/components/CoachChat";
import { calculateStreak, getUserActivityLogs, getDaysSinceLastActivity } from "@/lib/streakUtils";
import { SEO } from "@/components/SEO";

export default function Coach() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);
  const [daysSinceActivity, setDaysSinceActivity] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      
      const user = session.user;
      
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();
      setIsPremium(profile?.is_premium ?? false);

      // Load goals count
      const { count } = await supabase
        .from("goals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setGoalsCount(count ?? 0);

      // Load streak
      const logs = await getUserActivityLogs();
      setStreak(calculateStreak(logs));
      setDaysSinceActivity(getDaysSinceLastActivity(logs));
    };
    init();
  }, [navigate]);

  return (
    <>
      <SEO title="Coach - Momentum" description="Chat with your AI fitness coach." />
      <div className="min-h-screen bg-background-cream pb-24">
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 py-4">
          <h1 className="text-2xl font-display font-bold text-gradient">Coach</h1>
          <p className="text-sm text-muted-foreground">Your AI fitness companion</p>
        </header>

        <div className="container mx-auto px-4 py-4 max-w-2xl h-[calc(100vh-180px)]">
          <CoachChat
            userContext={{
              streak,
              goalsCount,
              lastActivity: daysSinceActivity === 0 ? "Active today" : 
                           daysSinceActivity === 1 ? "Active yesterday" : 
                           `${daysSinceActivity} days since last activity`,
              isPremium,
            }}
            fullPage
          />
        </div>
      </div>
    </>
  );
}
