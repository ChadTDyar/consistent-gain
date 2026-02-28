import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import PaywallModal from "@/components/PaywallModal";
import {
  Brain, Flame, TrendingUp, Calendar, Target, Moon, Zap,
  Loader2, Lock, ArrowLeft, BarChart3, AlertTriangle, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { type PlanTier } from "@/lib/plans";

interface WeeklyStats {
  totalWorkouts: number;
  uniqueDays: number;
  avgRating: number;
  consistencyScore: number;
  currentStreak: number;
  weeklyTrend: { week: string; count: number }[];
  bestDay: string | null;
  worstDay: string | null;
  painAreas: Record<string, number>;
  avgSleep: number;
  avgEnergy: number;
  goalCount: number;
}

export default function Insights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanTier>("free");
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("weekly-insights");
      if (fnError) throw fnError;
      setStats(data.stats);
      setAiInsights(data.aiInsights);
      setPlan(data.plan as PlanTier);
    } catch (e: any) {
      console.error("Insights error:", e);
      setError("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background-cream">
        <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error || "No data available"}</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const painEntries = Object.entries(stats.painAreas).sort(([, a], [, b]) => b - a);

  return (
    <>
      <SEO title="Insights - Momentum" description="AI-powered weekly intelligence report on your fitness habits." />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} feature="ai_coach" requiredPlan="plus" />

      <div className="min-h-screen bg-background-cream pb-24">
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-gradient flex items-center gap-2">
                <Brain className="h-6 w-6" /> Weekly Insights
              </h1>
              <p className="text-xs text-muted-foreground">Last 30 days analysis</p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Consistency Score */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-accent/5">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Consistency Score</p>
                <p className="text-6xl font-display font-bold text-foreground mt-2">{stats.consistencyScore}%</p>
              </div>
              <Progress value={stats.consistencyScore} className="h-3" />
              <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                <span>0%</span>
                <span>Target: 80%+</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-md">
              <CardContent className="pt-5 text-center">
                <Flame className="h-8 w-8 text-streak mx-auto mb-2" />
                <p className="text-3xl font-display font-bold text-foreground">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="pt-5 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-display font-bold text-foreground">{stats.uniqueDays}</p>
                <p className="text-sm text-muted-foreground">Active Days</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="pt-5 text-center">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-3xl font-display font-bold text-foreground">{stats.avgRating}</p>
                <p className="text-sm text-muted-foreground">Avg Wellness</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="pt-5 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-display font-bold text-foreground">{stats.totalWorkouts}</p>
                <p className="text-sm text-muted-foreground">Workouts</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend Chart */}
          {stats.weeklyTrend.length > 0 && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Weekly Trend
                </CardTitle>
                <CardDescription>Workouts per week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth() + 1}/${d.getDate()}`; }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={(v) => `Week of ${v}`} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Day Patterns */}
          {(stats.bestDay || stats.worstDay) && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-display font-semibold">Day Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.bestDay && (
                    <div className="p-4 rounded-lg bg-success/10 text-center">
                      <p className="text-sm text-muted-foreground">Strongest Day</p>
                      <p className="text-lg font-display font-bold text-foreground">{stats.bestDay}</p>
                    </div>
                  )}
                  {stats.worstDay && (
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Weakest Day</p>
                      <p className="text-lg font-display font-bold text-foreground">{stats.worstDay}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sleep & Energy */}
          {(stats.avgSleep > 0 || stats.avgEnergy > 0) && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-display font-semibold">Sleep & Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <Moon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-foreground">{stats.avgSleep}/5</p>
                    <p className="text-sm text-muted-foreground">Avg Sleep</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-streak" />
                    <p className="text-2xl font-bold text-foreground">{stats.avgEnergy}/5</p>
                    <p className="text-sm text-muted-foreground">Avg Energy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pain Hotspots */}
          {painEntries.length > 0 && (
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-display font-semibold">Pain Hotspots</CardTitle>
                <CardDescription>Most reported areas this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {painEntries.slice(0, 5).map(([area, count]) => (
                    <div key={area} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize text-foreground">{area}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / painEntries[0][1]) * 100} className="w-24 h-2" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          <Card className={`border-none shadow-lg ${plan === "free" ? "relative overflow-hidden" : "bg-gradient-to-br from-primary/5 to-accent/5"}`}>
            <CardHeader>
              <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Pattern Analysis
                {plan === "free" && <Lock className="h-4 w-4 text-muted-foreground" />}
                {plan === "pro" && <Badge className="text-xs">Pro - Deep Analysis</Badge>}
                {plan === "plus" && <Badge variant="secondary" className="text-xs">Plus</Badge>}
              </CardTitle>
              <CardDescription>
                {plan === "free"
                  ? "Upgrade to Plus or Pro for AI-powered insights"
                  : "Personalized analysis based on your 30-day data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plan === "free" ? (
                <div className="text-center py-6">
                  <div className="blur-sm select-none pointer-events-none mb-4 text-sm text-muted-foreground leading-relaxed">
                    <p>**Your Consistency Pattern** You've been showing up 4 out of 7 days this week...</p>
                    <p className="mt-2">**Recommendation** Try anchoring your workout to your morning coffee ritual...</p>
                  </div>
                  <Button onClick={() => setShowPaywall(true)} className="font-semibold">
                    <Lock className="mr-2 h-4 w-4" /> Unlock AI Insights
                  </Button>
                </div>
              ) : aiInsights ? (
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                  {aiInsights}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No insights available yet. Keep logging workouts!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
