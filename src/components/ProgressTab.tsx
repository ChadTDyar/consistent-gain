import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Loader2, Lock, BarChart3, Moon, Trophy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";

// Parse a YYYY-MM-DD date string as a LOCAL date (avoids UTC shift bugs).
function parseLocalDate(value: string): Date {
  // Strip time portion if present (we store DATE, not TIMESTAMP)
  const datePart = value.length > 10 ? value.slice(0, 10) : value;
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
import { type PlanTier, getHistoryDays } from "@/lib/plans";
import { UpgradeWall } from "@/components/UpgradeWall";
import { MOMENTUM } from "@/constants/value-language";

interface ActivityLog {
  id: string;
  completed_at: string;
  rpe_rating: number | null;
}

interface ProgressTabProps {
  plan?: PlanTier;
}

// How many trailing weeks the Consistency section looks back over.
const CONSISTENCY_WEEKS = 4;
// Fallback weekly target when the user has no goals with a target set yet.
const DEFAULT_WEEKLY_TARGET = 3;

interface WeekBucket {
  daysLogged: number;
  target: number;
  ratio: number; // daysLogged / target, capped at 1.0
  metTarget: boolean;
}

export function ProgressTab({ plan = 'free' }: ProgressTabProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [weekStreak, setWeekStreak] = useState(0);
  const [weekAverage, setWeekAverage] = useState(0);
  const [lastWeekAverage, setLastWeekAverage] = useState(0);
  const [showHistoryWall, setShowHistoryWall] = useState(false);

  // Consistency section state.
  const [weeklyTarget, setWeeklyTarget] = useState(DEFAULT_WEEKLY_TARGET);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [weeksAtTarget, setWeeksAtTarget] = useState(0);
  const [recoveryDays, setRecoveryDays] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadProgressData(controller.signal);
    loadConsistencyData(controller.signal);
    return () => controller.abort();
  }, [plan]);

  // Refresh immediately when a daily check-in is saved elsewhere in the app.
  useEffect(() => {
    const onCheckin = () => {
      loadProgressData();
      loadConsistencyData();
    };
    window.addEventListener("checkin-saved", onCheckin);
    return () => window.removeEventListener("checkin-saved", onCheckin);
  }, [plan]);

  const loadProgressData = async (signal?: AbortSignal) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        navigate("/auth");
        return;
      }

      const historyDays = getHistoryDays(plan) ?? 365;
      const daysAgo = subDays(new Date(), historyDays);
      const query = supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .gte("completed_at", daysAgo.toISOString())
        .order("completed_at", { ascending: true });
      const { data, error } = await (signal ? query.abortSignal(signal) : query);

      if (error) {
        console.error("Error loading progress data:", error);
        return;
      }

      // Process chart data
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const logsForDay = data?.filter(log => {
          const logDate = parseLocalDate(log.completed_at);
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

      // Calculate this week's streak (week starts Monday for consistency)
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const thisWeekLogs = data?.filter(log => {
        const logDate = parseLocalDate(log.completed_at);
        return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
      }) || [];

      const uniqueDays = new Set(
        thisWeekLogs.map(log => parseLocalDate(log.completed_at).toDateString())
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
        const logDate = parseLocalDate(log.completed_at);
        return isWithinInterval(logDate, { start: lastWeekStart, end: lastWeekEnd });
      }) || [];

      const lastWeekRatings = lastWeekLogs
        .map(log => log.rpe_rating)
        .filter((rating): rating is number => rating !== null);

      const lastWeekAvg = lastWeekRatings.length > 0
        ? lastWeekRatings.reduce((sum, r) => sum + r, 0) / lastWeekRatings.length
        : 0;
      setLastWeekAverage(lastWeekAvg);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error("Error loading progress data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Consistency measures how often the user actually shows up relative to
  // their own target, and whether recovery is part of that pattern — not
  // just an unbroken daily streak. Deliberately queried un-gated by plan:
  // free-plan history limits are for the chart, not for whether someone can
  // see their own adherence.
  const loadConsistencyData = async (signal?: AbortSignal) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const since28 = subDays(new Date(), 28);

      const [goalsRes, logsRes, contextRes] = await Promise.all([
        supabase
          .from("goals")
          .select("target_days_per_week")
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .eq("is_archived", false),
        supabase
          .from("activity_logs")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("is_deleted", false)
          .gte("completed_at", since28.toISOString()),
        supabase
          .from("daily_context")
          .select("date, recommendation")
          .eq("user_id", user.id)
          .gte("date", format(since28, "yyyy-MM-dd")),
      ]);

      if (signal?.aborted) return;

      const goals = goalsRes.data || [];
      const target = goals.length > 0
        ? goals.reduce((sum, g: any) => sum + (g.target_days_per_week || 0), 0)
        : DEFAULT_WEEKLY_TARGET;
      setWeeklyTarget(target);

      const logs = logsRes.data || [];
      const contextRows = contextRes.data || [];

      const recovery = contextRows.filter(
        (row: any) => row.recommendation === "mobility" || row.recommendation === "rest"
      ).length;
      setRecoveryDays(recovery);

      const today = new Date();
      const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

      const buckets: WeekBucket[] = Array.from({ length: CONSISTENCY_WEEKS }, (_, i) => {
        const bucketStart = subDays(currentWeekStart, 7 * i);
        const bucketEnd = endOfWeek(bucketStart, { weekStartsOn: 1 });

        const daysInBucket = new Set(
          logs
            .filter((log: any) => {
              const logDate = parseLocalDate(log.completed_at);
              return isWithinInterval(logDate, { start: bucketStart, end: bucketEnd });
            })
            .map((log: any) => parseLocalDate(log.completed_at).toDateString())
        );

        const daysLogged = daysInBucket.size;
        const ratio = target > 0 ? Math.min(daysLogged / target, 1) : 0;

        return { daysLogged, target, ratio, metTarget: target > 0 && daysLogged >= target };
      });

      setSessionsThisWeek(buckets[0]?.daysLogged ?? 0);
      setWeeksAtTarget(buckets.filter((b) => b.metTarget).length);

      const avgRatio = buckets.reduce((sum, b) => sum + b.ratio, 0) / buckets.length;
      setAdherenceRate(Math.round(avgRatio * 100));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error("Error loading consistency data:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasData = chartData.some(d => d.rating !== null) || weekStreak > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
        <div className="h-20 w-20 rounded-full border-4 border-muted flex items-center justify-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">No progress data yet.</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Log your first habit check-in and your progress will appear here.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="font-semibold" style={{ background: '#0d3b5e' }}>
          Log Today's Check-In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Consistency */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-success/10 to-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {sessionsThisWeek}/{weeklyTarget}
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Sessions logged this week toward your target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-lg bg-card/60 p-4 text-center">
              <p className="text-2xl font-display font-bold text-foreground">{adherenceRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">4-week adherence</p>
            </div>
            <div className="rounded-lg bg-card/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-2xl font-display font-bold text-foreground">{recoveryDays}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Recovery days honored (28d)</p>
            </div>
            <div className="rounded-lg bg-card/60 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="text-2xl font-display font-bold text-foreground">{weeksAtTarget}/{CONSISTENCY_WEEKS}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Weeks at target</p>
            </div>
          </div>
          {recoveryDays > 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Resting or going light when your plan called for it counts toward showing up — it's not a gap in your consistency.
            </p>
          )}
        </CardContent>
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
            {weekAverage > lastWeekAverage && weekAverage > 0 && (
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
          <CardTitle className="text-2xl font-display font-semibold">
            Wellness Ratings (Last {getHistoryDays(plan) ?? '∞'} Days)
            {plan === 'free' && <Lock className="inline ml-2 h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription className="text-base">
            Track how you feel after workouts
            {plan === 'free' && (
              <button
                type="button"
                onClick={() => setShowHistoryWall(true)}
                className="text-primary ml-1 text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Upgrade for 30+ days
              </button>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {plan === 'free' && (
            // MUST be a real <button>: this overlay is the primary upgrade
            // affordance over the chart. Keyboard users need to Tab to it,
            // and screen readers must announce it as actionable.
            <button
              type="button"
              className="absolute inset-0 z-10 cursor-pointer flex items-end justify-center pb-8 bg-transparent border-0 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              onClick={() => setShowHistoryWall(true)}
              aria-label="Free plan shows 7 days of history. Opens upgrade dialog to unlock 30 days or more."
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent rounded-lg" aria-hidden="true" />
              <p className="relative text-sm font-semibold text-foreground bg-card/90 px-4 py-2 rounded-lg shadow border border-border" aria-hidden="true">
                Free plan shows 7 days · Tap to unlock more history
              </p>
            </button>
          )}
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

      {showHistoryWall && (
        <UpgradeWall
          headline={MOMENTUM.walls.history_limit.headline}
          body={MOMENTUM.walls.history_limit.body}
          cta={MOMENTUM.walls.history_limit.cta}
          accentColor="#0d3b5e"
          gate="history_limit"
          tier="premium"
          onUpgrade={() => { setShowHistoryWall(false); navigate("/pricing"); }}
          onDismiss={() => setShowHistoryWall(false)}
        />
      )}
    </div>
  );
}
