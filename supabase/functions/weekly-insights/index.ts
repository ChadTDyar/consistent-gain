import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch last 30 days of activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [activitiesRes, painRes, contextRes, goalsRes] = await Promise.all([
      supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("completed_at", thirtyDaysAgo.toISOString()).order("completed_at", { ascending: true }),
      supabase.from("pain_reports").select("*").eq("user_id", user.id).gte("report_date", thirtyDaysAgo.toISOString()),
      supabase.from("daily_context").select("*").eq("user_id", user.id).gte("date", thirtyDaysAgo.toISOString().split("T")[0]),
      supabase.from("goals").select("*").eq("user_id", user.id),
    ]);

    const activities = activitiesRes.data || [];
    const painReports = painRes.data || [];
    const dailyContext = contextRes.data || [];
    const goals = goalsRes.data || [];

    // Compute stats
    const totalWorkouts = activities.length;
    const uniqueDays = new Set(activities.map(a => a.completed_at)).size;
    const avgRating = totalWorkouts > 0
      ? activities.reduce((sum: number, a: any) => sum + (a.rpe_rating || 0), 0) / activities.filter((a: any) => a.rpe_rating).length || 0
      : 0;

    // Weekly breakdown
    const weeks: Record<string, number> = {};
    activities.forEach((a: any) => {
      const d = new Date(a.completed_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeks[key] = (weeks[key] || 0) + 1;
    });

    const weeklyTrend = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).map(([week, count]) => ({ week, count }));

    // Best/worst days
    const dayOfWeekCounts: Record<number, number> = {};
    activities.forEach((a: any) => {
      const day = new Date(a.completed_at).getDay();
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
    });
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bestDay = Object.entries(dayOfWeekCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0];
    const worstDay = Object.entries(dayOfWeekCounts).sort(([, a], [, b]) => (a as number) - (b as number))[0];

    // Pain patterns
    const painAreas: Record<string, number> = {};
    painReports.forEach((p: any) => {
      painAreas[p.body_area] = (painAreas[p.body_area] || 0) + 1;
    });

    // Sleep/energy correlation
    const avgSleep = dailyContext.length > 0
      ? dailyContext.reduce((sum: number, c: any) => sum + (c.sleep_quality || 0), 0) / dailyContext.filter((c: any) => c.sleep_quality).length || 0
      : 0;
    const avgEnergy = dailyContext.length > 0
      ? dailyContext.reduce((sum: number, c: any) => sum + (c.energy_level || 0), 0) / dailyContext.filter((c: any) => c.energy_level).length || 0
      : 0;

    // Consistency score (0-100)
    const consistencyScore = Math.min(100, Math.round((uniqueDays / 30) * 100));

    // Streak calculation
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activities.some((a: any) => a.completed_at === dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const stats = {
      totalWorkouts,
      uniqueDays,
      avgRating: Math.round(avgRating * 10) / 10,
      consistencyScore,
      currentStreak,
      weeklyTrend,
      bestDay: bestDay ? dayNames[parseInt(bestDay[0])] : null,
      worstDay: worstDay ? dayNames[parseInt(worstDay[0])] : null,
      painAreas,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      goalCount: goals.length,
    };

    // Check user plan for AI depth
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    const plan = profile?.plan || "free";

    // Generate AI insights for Plus/Pro users
    let aiInsights = null;
    if (plan !== "free") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        const depth = plan === "pro" ? "deep" : "standard";
        const systemPrompt = depth === "deep"
          ? `You are a fitness pattern analyst. Analyze the user's 30-day data and provide: 1) A 2-sentence summary of their consistency pattern, 2) Their strongest habit signal, 3) Their biggest risk factor for dropping off, 4) One specific, actionable recommendation for next week, 5) A motivational insight connecting their data to long-term habit formation science. Be specific with numbers. Use encouraging but honest tone. Keep total response under 200 words. Format with clear headers using **.`
          : `You are a fitness pattern analyst. Analyze the user's 30-day data and provide: 1) A 2-sentence summary of their consistency, 2) One specific recommendation for next week. Keep it under 80 words. Be encouraging but honest. Format with ** headers.`;

        const userPrompt = `User data (last 30 days):
- Total workouts: ${stats.totalWorkouts}
- Active days: ${stats.uniqueDays}/30
- Consistency score: ${stats.consistencyScore}%
- Current streak: ${stats.currentStreak} days
- Avg wellness rating: ${stats.avgRating}/5
- Best workout day: ${stats.bestDay || "N/A"}
- Weakest day: ${stats.worstDay || "N/A"}
- Pain areas reported: ${Object.keys(stats.painAreas).join(", ") || "None"}
- Avg sleep quality: ${stats.avgSleep}/5
- Avg energy: ${stats.avgEnergy}/5
- Goals set: ${stats.goalCount}
- Weekly trend: ${stats.weeklyTrend.map(w => `${w.week}: ${w.count}`).join(", ")}`;

        try {
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiInsights = aiData.choices?.[0]?.message?.content || null;
          }
        } catch (e) {
          console.error("AI insights error:", e);
        }
      }
    }

    return new Response(JSON.stringify({ stats, aiInsights, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
