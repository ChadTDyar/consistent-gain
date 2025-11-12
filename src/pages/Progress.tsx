import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flame, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface ActivityLog {
  id: string;
  completed_at: string;
  rpe_rating: number | null;
}

export default function Progress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [weekStreak, setWeekStreak] = useState(0);
  const [weekAverage, setWeekAverage] = useState(0);
  const [lastWeekAverage, setLastWeekAverage] = useState(0);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Load last 30 days of activity logs with ratings
    const thirtyDaysAgo = subDays(new Date(), 30);
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_at", thirtyDaysAgo.toISOString())
      .order("completed_at", { ascending: true });

    if (error) {
      console.error("Error loading progress data:", error);
      setLoading(false);
      return;
    }

    setLogs(data || []);
    
    // Process chart data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const logsForDay = data?.filter(log => {
        const logDate = new Date(log.completed_at);
        return logDate.toDateString() === date.toDateString();
      }) || [];
      
      const ratingsForDay = logsForDay
        .map(log => log.rpe_rating)
        .filter((rating): rating is number => rating !== null);
      
      const avgRating = ratingsForDay.length > 0
        ? ratingsForDay.reduce((sum, r) => sum + r, 0) / ratingsForDay.length
        : null;

      return {
        date: format(date, "MMM d"),
        rating: avgRating,
      };
    });
    
    setChartData(last30Days);

    // Calculate this week's streak
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    
    const thisWeekLogs = data?.filter(log => {
      const logDate = new Date(log.completed_at);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    }) || [];

    const uniqueDays = new Set(
      thisWeekLogs.map(log => new Date(log.completed_at).toDateString())
    );
    setWeekStreak(uniqueDays.size);

    // Calculate this week's average
    const thisWeekRatings = thisWeekLogs
      .map(log => log.rpe_rating)
      .filter((rating): rating is number => rating !== null);
    
    const thisWeekAvg = thisWeekRatings.length > 0
      ? thisWeekRatings.reduce((sum, r) => sum + r, 0) / thisWeekRatings.length
      : 0;
    setWeekAverage(thisWeekAvg);

    // Calculate last week's average
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekEnd, 7);
    
    const lastWeekLogs = data?.filter(log => {
      const logDate = new Date(log.completed_at);
      return isWithinInterval(logDate, { start: lastWeekStart, end: lastWeekEnd });
    }) || [];

    const lastWeekRatings = lastWeekLogs
      .map(log => log.rpe_rating)
      .filter((rating): rating is number => rating !== null);
    
    const lastWeekAvg = lastWeekRatings.length > 0
      ? lastWeekRatings.reduce((sum, r) => sum + r, 0) / lastWeekRatings.length
      : 0;
    setLastWeekAverage(lastWeekAvg);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")} 
          className="mb-8 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
            Your Progress
          </h1>

          {/* Week Streak */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-success/10 to-primary/5">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Flame className="h-10 w-10 text-streak flame-pulse" />
                <CardTitle className="text-4xl md:text-5xl font-display font-bold text-foreground">
                  {weekStreak}
                </CardTitle>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                You've worked out {weekStreak} {weekStreak === 1 ? "day" : "days"} this week
              </p>
            </CardHeader>
          </Card>

          {/* Weekly Comparison */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Weekly Comparison</CardTitle>
              <CardDescription className="text-base">How you're feeling week over week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-lg text-muted-foreground mb-2">
                  Average this week: <span className="font-bold text-foreground text-2xl">{weekAverage.toFixed(1)}</span>
                </p>
                <p className="text-lg text-muted-foreground">
                  vs last week: <span className="font-bold text-foreground text-2xl">{lastWeekAverage.toFixed(1)}</span>
                </p>
                {weekAverage > lastWeekAverage && (
                  <p className="text-success font-semibold mt-4 text-lg">
                    🎉 You're improving! Keep it up!
                  </p>
                )}
                {weekAverage < lastWeekAverage && weekAverage > 0 && (
                  <p className="text-muted-foreground font-semibold mt-4 text-lg">
                    Take care of yourself. Rest is important too!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ratings Chart */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Wellness Ratings (Last 30 Days)</CardTitle>
              <CardDescription className="text-base">Track how you feel after workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground px-4">
                <span>1 = Exhausted</span>
                <span>3 = Okay</span>
                <span>5 = Energized</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
