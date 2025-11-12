import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, LogOut, Settings as SettingsIcon, TrendingUp } from "lucide-react";
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
import momentumLogo from "@/assets/momentum-logo.png";

interface Profile {
  id: string;
  name: string | null;
  is_premium: boolean;
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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadProfile();
    loadGoals();
    loadStreakData();
    checkTriggerMessages();
  }, []);

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

    // Check for new user welcome
    const { data: goals } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id);

    const isNewUser = !goals || goals.length === 0;

    // Check if triggers have been sent
    const { data: triggers } = await supabase
      .from("coach_triggers")
      .select("trigger_type")
      .eq("user_id", user.id);

    const sentTriggers = new Set(triggers?.map(t => t.trigger_type) || []);

    if (isNewUser && !sentTriggers.has("welcome")) {
      setWelcomeMessage("Welcome to Momentum! I'm Coach, your AI fitness companion. I'm here to help you build sustainable habits. Want help setting your first goal?");
      setShowWelcome(true);
      
      // Mark welcome as sent
      await supabase.from("coach_triggers").insert({
        user_id: user.id,
        trigger_type: "welcome"
      });
    } else {
      // Check for 7-day streak celebration
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

      // Check for missed 3+ days - show streak repair
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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    if (profile?.is_premium) {
      return true; // Unlimited goals for premium
    }
    return goals.length < 3; // Free users get 3 goals
  };

  const handleAddGoal = () => {
    if (!canAddGoal()) {
      toast.error("Upgrade to premium to add more goals", {
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing"),
        },
      });
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
          <div className="flex items-center gap-3">
            <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Momentum</h1>
          </div>
          <div className="flex gap-2">
            {!profile?.is_premium && (
              <Button 
                onClick={() => navigate("/pricing")} 
                className="hidden sm:flex shadow-md hover:shadow-lg transition-all btn-gradient"
              >
                Upgrade to Premium
              </Button>
            )}
            <ThemeToggle />
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
            {canAddGoal() && (
              <Button 
                onClick={handleAddGoal} 
                size="lg"
                className="w-full md:w-auto shadow-sm hover:shadow-md"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Goal
              </Button>
            )}
          </>
        )}
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTab />
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
        }}
        autoOpen={showWelcome}
        welcomeMessage={welcomeMessage}
      />

      <StreakRepair
        daysMissed={daysSinceActivity}
        open={showStreakRepair}
        onClose={() => setShowStreakRepair(false)}
      />
    </div>
  );
}
