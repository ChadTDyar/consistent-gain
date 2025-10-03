import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, LogOut, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";
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
  target_days_per_week: number;
  created_at: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadProfile();
    loadGoals();
  }, []);

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
      return goals.length < 3;
    }
    return goals.length < 1;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Momentum</h1>
          </div>
          <div className="flex gap-2">
            {!profile?.is_premium && (
              <Button 
                onClick={() => navigate("/pricing")} 
                className="hidden sm:flex shadow-sm hover:shadow-md transition-shadow"
              >
                Upgrade to Premium
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
              className="border-2"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSignOut}
              className="border-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground">
            Welcome back, {profile?.name || "there"}!
          </h2>
          <p className="text-lg text-muted-foreground">
            {goals.length === 0
              ? "Start building your first habit today"
              : `You have ${goals.length} active ${goals.length === 1 ? "goal" : "goals"}`}
          </p>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="max-w-md mx-auto bg-card p-8 md:p-12 rounded-xl shadow-md">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-3 text-foreground">
                Ready to start your journey?
              </h3>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Create your first goal and start building lasting habits
              </p>
              <Button onClick={handleAddGoal} size="lg" className="btn-large shadow-md hover:shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Goal
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={loadGoals} />
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
      </main>

      <AddGoalDialog
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        onGoalAdded={loadGoals}
      />
    </div>
  );
}
