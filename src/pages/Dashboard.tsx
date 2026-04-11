import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, LogOut, Settings as SettingsIcon, TrendingUp, UserCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { ProgressTab } from "@/components/ProgressTab";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BodyMapPainReport } from "@/components/BodyMapPainReport";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CostTracker } from "@/components/CostTracker";
import { DataExport } from "@/components/DataExport";
import { CalendarReminder } from "@/components/CalendarReminder";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { EditGoalDialog } from "@/components/EditGoalDialog";
import { CoachChat } from "@/components/CoachChat";
import { calculateStreak, getUserActivityLogs, getDaysSinceLastActivity } from "@/lib/streakUtils";
import { MicroblockSuggestion } from "@/components/MicroblockSuggestion";
import { DailyContext } from "@/components/DailyContext";
import { StreakRepair } from "@/components/StreakRepair";
import PaywallModal from "@/components/PaywallModal";
import momentumLogo from "@/assets/momentum-logo.png";
import { type PlanTier, canAccessFeature, getGoalLimit } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { analytics } from "@/lib/analytics";
import { UpgradeWall } from "@/components/UpgradeWall";
import { MOMENTUM } from "@/constants/value-language";
import { Users, BarChart3 } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  is_premium: boolean;
  plan: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_days_per_week: number;
  created_at: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [daysSinceActivity, setDaysSinceActivity] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [showStreakRepair, setShowStreakRepair] = useState(false);
  const [showMicroblock, setShowMicroblock] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string>('goals');
  const [paywallPlan, setPaywallPlan] = useState<PlanTier>('plus');
  const [showUpgradeWall, setShowUpgradeWall] = useState(false);
  const [upgradeWallType, setUpgradeWallType] = useState<'habit_limit' | 'partner_lock' | 'analytics_lock' | 'ai_coach' | 'history_limit'>('habit_limit');
  const navigate = useNavigate();

  const plan = (profile?.plan || 'free') as PlanTier;

  useEffect(() => {
    checkAuth();
    loadProfile();
    loadGoals();
    loadStreakData();
    checkTriggerMessages();
    checkSubscription();
  }, []);

  // Fire activation event when user has both goals and a streak
  useEffect(() => {
    if (goals.length > 0 && streak > 0) {
      analytics.activation();
    }
  }, [goals.length, streak]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data?.plan) {
        // Profile will be updated server-side, just reload
        loadProfile();
      }
    } catch (e) {
      // Silent fail - profile data is still available
    }
  };

  const loadStreakData = async () => {
    const logs = await getUserActivityLogs();
    const currentStreak = calculateStreak(logs);
    const daysSince = getDaysSinceLastActivity(logs);
    setStreak(currentStreak);
    setDaysSinceActivity(daysSince);
  };

  const checkTriggerMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: goals } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id);

    const isNewUser = !goals || goals.length === 0;

    const { data: triggers } = await supabase
      .from("coach_triggers")
      .select("trigger_type")
      .eq("user_id", user.id);

    const sentTriggers = new Set(triggers?.map(t => t.trigger_type) || []);

    if (isNewUser && !sentTriggers.has("welcome")) {
      setWelcomeMessage("Welcome to Momentum! I'm Coach, your AI fitness companion. I'm here to help you build sustainable habits. Want help setting your first goal?");
      setShowWelcome(true);
      
      await supabase.from("coach_triggers").insert({
        user_id: user.id,
        trigger_type: "welcome"
      });
    } else {
      const logs = await getUserActivityLogs();
      const currentStreak = calculateStreak(logs);
      
      if (currentStreak === 7 && !sentTriggers.has("streak_7")) {
        setWelcomeMessage("🔥 7 days in a row - that's amazing! You're building real consistency. How are you feeling?");
        setShowWelcome(true);
        
        await supabase.from("coach_triggers").insert({
          user_id: user.id,
          trigger_type: "streak_7"
        });
      }

      const daysSince = getDaysSinceLastActivity(logs);
      if (daysSince >= 3 && !sentTriggers.has("missed_3_days")) {
        setShowStreakRepair(true);
        
        await supabase.from("coach_triggers").insert({
          user_id: user.id,
          trigger_type: "missed_3_days"
        });
      }
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    setProfile(data);
  };

  const loadGoals = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load goals");
      console.error(error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const canAddGoal = () => {
    const limit = getGoalLimit(plan);
    if (limit === null) return true;
    return goals.length < limit;
  };

  const handleAddGoal = () => {
    if (!canAddGoal()) {
      setUpgradeWallType('habit_limit');
      setShowUpgradeWall(true);
      return;
    }
    setShowAddGoal(true);
  };

  const handleEditGoal = (goalId: string) => {
    setEditingGoalId(goalId);
    setShowEditGoal(true);
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
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-semibold"
      >
        Skip to main content
      </a>
      <header className="border-b border-border bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center max-w-7xl">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/profile")}
            role="link"
            aria-label="Go to profile"
          >
            <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Momentum</h1>
            <Badge 
              variant={plan === 'free' ? 'outline' : 'secondary'} 
              className={`text-xs font-bold uppercase ${
                plan === 'pro' ? 'bg-secondary text-secondary-foreground' : 
                plan === 'plus' ? 'badge-premium' : ''
              }`}
            >
              {plan === 'free' ? 'Free' : plan === 'plus' ? 'Pro' : 'Premium'}
            </Badge>
          </div>
          <div className="flex gap-2">
            {plan === 'free' && (
              <Button 
                onClick={() => navigate("/pricing")} 
                className="hidden sm:flex shadow-md hover:shadow-lg transition-all btn-gradient"
              >
                Upgrade
              </Button>
            )}
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/profile")}
              className="border-2 min-w-[44px] min-h-[44px]"
              aria-label="View profile"
            >
              <UserCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
              className="border-2 min-w-[44px] min-h-[44px]"
              aria-label="Open settings"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSignOut}
              className="border-2 min-w-[44px] min-h-[44px]"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 text-gradient">
            Welcome back, {profile?.name || "there"}!
          </h2>
          <p className="text-lg text-muted-foreground">
            {goals.length === 0
              ? "Start building your first habit today"
              : `You have ${goals.length} active ${goals.length === 1 ? "goal" : "goals"}`}
          </p>
        </div>

        <OnboardingChecklist
          hasGoals={goals.length > 0}
          hasCheckin={streak > 0}
          onCreateGoal={handleAddGoal}
        />

        <Tabs defaultValue="goals" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="goals" className="text-base">
              Goals
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-base">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-8">
            {/* Health Tracking & Context Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DailyContext />
              <BodyMapPainReport onComplete={() => loadStreakData()} />
              <WeatherWidget />
              <CostTracker />
              <CalendarReminder />
              {showMicroblock && (
                <MicroblockSuggestion onComplete={() => {
                  setShowMicroblock(false);
                  loadStreakData();
                }} />
              )}
            </div>

            {!showMicroblock && (
              <Button
                onClick={() => setShowMicroblock(true)}
                variant="outline"
                className="mb-4"
              >
                Show Microblock Suggestion
              </Button>
            )}

            {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="max-w-md text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Plus className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-bold text-foreground">
                  Ready to start your journey?
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Create your first fitness goal and start building momentum. Small consistent steps lead to lasting change.
                </p>
              </div>
              <Button 
                onClick={handleAddGoal} 
                size="lg" 
                className="btn-large shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg h-14 px-10 btn-gradient"
              >
                <Plus className="mr-2 h-6 w-6" />
                Create Your First Goal
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {goals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={loadGoals}
                  onEdit={handleEditGoal}
                />
              ))}
            </div>
            <Button 
              onClick={handleAddGoal} 
              size="lg"
              className="w-full md:w-auto shadow-sm hover:shadow-md"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Goal
              {!canAddGoal() && <Lock className="ml-2 h-4 w-4" />}
            </Button>
          </>
        )}

            {/* Accountability Partner Section */}
            <div className="mt-8">
              <h3 className="text-xl font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" /> Accountability Partner
                {plan === 'free' && <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />Pro</Badge>}
              </h3>
              {plan === 'free' ? (
                <div
                  className="p-6 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setUpgradeWallType('partner_lock'); setShowUpgradeWall(true); }}
                >
                  <p className="text-sm text-muted-foreground">Your partner sees your weekly completion. You see theirs. The social pressure is real.</p>
                  <p className="text-xs text-primary font-semibold mt-2">Tap to unlock →</p>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                  <p className="text-sm text-muted-foreground">Invite a workout partner to keep each other accountable. Coming soon!</p>
                </div>
              )}
            </div>

            {/* Trend Analytics Section */}
            <div className="mt-8">
              <h3 className="text-xl font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Trend Analytics
                {plan === 'free' && <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />Pro</Badge>}
              </h3>
              {plan === 'free' ? (
                <div
                  className="relative p-6 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                  onClick={() => { setUpgradeWallType('analytics_lock'); setShowUpgradeWall(true); }}
                >
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="flex gap-2 items-end h-24">
                      {[3, 5, 4, 6, 2, 7, 5].map((v, i) => (
                        <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${v * 14}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-semibold text-foreground bg-card/90 px-4 py-2 rounded-lg shadow">
                      Trend analytics unlock on Pro — $4.99/month
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 rounded-xl border border-border bg-card shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/insights")}
                >
                  <p className="text-sm text-muted-foreground">View your weekly trends, day patterns, and AI insights.</p>
                  <p className="text-xs text-primary font-semibold mt-2">Open Insights →</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTab plan={plan} />
          </TabsContent>
        </Tabs>
      </main>

      <AddGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        onGoalAdded={loadGoals}
      />

      <EditGoalDialog
        open={showEditGoal}
        onOpenChange={setShowEditGoal}
        onGoalUpdated={loadGoals}
        goalId={editingGoalId}
      />

      <CoachChat
        userContext={{
          streak: streak,
          goalsCount: goals.length,
          lastActivity: daysSinceActivity === 0 ? "Active today" : 
                       daysSinceActivity === 1 ? "Active yesterday" : 
                       `${daysSinceActivity} days since last activity`,
          isPremium: profile?.is_premium || false,
          plan,
        }}
        autoOpen={showWelcome}
        welcomeMessage={welcomeMessage}
      />

      <StreakRepair
        daysMissed={daysSinceActivity}
        open={showStreakRepair}
        onClose={() => setShowStreakRepair(false)}
        plan={plan}
      />

      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature={paywallFeature}
        requiredPlan={paywallPlan}
      />

      {showUpgradeWall && (
        <UpgradeWall
          headline={MOMENTUM.walls[upgradeWallType].headline}
          body={MOMENTUM.walls[upgradeWallType].body}
          cta={MOMENTUM.walls[upgradeWallType].cta}
          accentColor="#0d3b5e"
          onUpgrade={() => { setShowUpgradeWall(false); navigate("/pricing"); }}
          onDismiss={() => setShowUpgradeWall(false)}
        />
      )}
    </div>
  );
}
