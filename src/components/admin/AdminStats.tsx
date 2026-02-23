import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Activity, MessageSquare, Star, DollarSign } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalGoals: number;
  totalActivities: number;
  totalMessages: number;
  totalTestimonials: number;
  premiumUsers: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalGoals: 0,
    totalActivities: 0,
    totalMessages: 0,
    totalTestimonials: 0,
    premiumUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [profiles, goals, activities, messages, testimonials] = await Promise.all([
      supabase.from("profiles").select("id, is_premium", { count: "exact" }),
      supabase.from("goals").select("id", { count: "exact" }),
      supabase.from("activity_logs").select("id", { count: "exact" }),
      supabase.from("chat_messages").select("id", { count: "exact" }),
      supabase.from("testimonials").select("id", { count: "exact" }),
    ]);

    setStats({
      totalUsers: profiles.count ?? 0,
      totalGoals: goals.count ?? 0,
      totalActivities: activities.count ?? 0,
      totalMessages: messages.count ?? 0,
      totalTestimonials: testimonials.count ?? 0,
      premiumUsers: profiles.data?.filter((p) => p.is_premium).length ?? 0,
    });
    setLoading(false);
  };

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Premium Users", value: stats.premiumUsers, icon: DollarSign, color: "text-green-500" },
    { label: "Goals Created", value: stats.totalGoals, icon: Target, color: "text-blue-500" },
    { label: "Activity Logs", value: stats.totalActivities, icon: Activity, color: "text-orange-500" },
    { label: "Chat Messages", value: stats.totalMessages, icon: MessageSquare, color: "text-purple-500" },
    { label: "Testimonials", value: stats.totalTestimonials, icon: Star, color: "text-yellow-500" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="py-6">
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
