import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Flame, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
}

interface ActivityLog {
  completed_at: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
  onEdit: (goalId: string) => void;
}

export function GoalCard({ goal, onUpdate, onEdit }: GoalCardProps) {
  const [streak, setStreak] = useState(0);
  const [last7Days, setLast7Days] = useState<Array<{ date: string; completed: boolean }>>([]);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadActivityData();
  }, [goal.id]);

  const loadActivityData = async () => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("completed_at")
      .eq("goal_id", goal.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Error loading activity:", error);
      return;
    }

    const logs = data as ActivityLog[];
    calculateStreak(logs);
    calculateLast7Days(logs);
    checkLoggedToday(logs);
  };

  const calculateStreak = (logs: ActivityLog[]) => {
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.completed_at);
      logDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === currentStreak || (daysDiff === 0 && currentStreak === 0)) {
        currentStreak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const calculateLast7Days = (logs: ActivityLog[]) => {
    const days: Array<{ date: string; completed: boolean }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const hasLog = logs.some((log) => {
        const logDate = new Date(log.completed_at);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === checkDate.getTime();
      });

      days.push({ 
        date: checkDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed: hasLog 
      });
    }

    setLast7Days(days);
  };

  const checkLoggedToday = (logs: ActivityLog[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = logs.find((log) => {
      const logDate = new Date(log.completed_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    setAlreadyLoggedToday(!!todayLog);
  };

  const handleLogActivity = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (alreadyLoggedToday) return;

    setLoggingActivity(true);
    const today = new Date().toISOString().split("T")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("activity_logs").insert({
      goal_id: goal.id,
      user_id: user.id,
      completed_at: today,
    });

    if (error) {
      toast.error("Failed to log activity");
      console.error(error);
    } else {
      analytics.goalCompleted(streak + 1);
      if ((streak + 1) % 7 === 0) {
        analytics.streakMilestone(streak + 1);
      }
      toast.success("Great job! 🎉 Streak continues!");
      loadActivityData();
      onUpdate();
    }

    setLoggingActivity(false);
  };

  const handleCardClick = () => {
    navigate(`/goal/${goal.id}`);
  };

  return (
    <Card 
      className="card-lift cursor-pointer border-none shadow-md hover:shadow-xl bg-card relative overflow-hidden" 
      onClick={handleCardClick}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-display font-semibold text-foreground line-clamp-2">{goal.title}</CardTitle>
            {goal.category && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {goal.category}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal.id);
            }}
            className="h-10 w-10 hover:bg-accent flex-shrink-0 min-w-[44px] min-h-[44px]"
            aria-label={`Edit ${goal.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {goal.description && (
          <CardDescription className="line-clamp-2 text-base leading-relaxed">
            {goal.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-full shadow-glow" style={{background: 'var(--gradient-secondary)'}}>
          <Flame className="h-6 w-6 text-white flame-pulse" />
          <span className="font-display font-bold text-xl text-white">
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="flex gap-1 justify-center py-2">
          {last7Days.map((day, index) => (
            <div
              key={index}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                day.completed
                  ? "bg-success text-success-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
              title={day.date}
            >
              {day.completed ? "✓" : "−"}
            </div>
          ))}
        </div>

        <Button
          onClick={handleLogActivity}
          className="w-full shadow-sm hover:shadow-md transition-all font-semibold"
          size="lg"
          disabled={alreadyLoggedToday || loggingActivity}
        >
          {loggingActivity ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Logging...
            </>
          ) : alreadyLoggedToday ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Completed Today
            </>
          ) : (
            "Log Today"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
