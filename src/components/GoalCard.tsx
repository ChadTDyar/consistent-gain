import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  description: string | null;
}

interface ActivityLog {
  completed_at: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [streak, setStreak] = useState(0);
  const [last7Days, setLast7Days] = useState<boolean[]>([]);
  const [loggedToday, setLoggedToday] = useState(false);
  const [loading, setLoading] = useState(false);
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
    const days: boolean[] = [];
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

      days.push(hasLog);
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

    setLoggedToday(!!todayLog);
  };

  const handleLogToday = async () => {
    if (loggedToday) return;

    setLoading(true);
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
      toast.success("Great job! Streak continues! 🔥");
      loadActivityData();
      onUpdate();
    }

    setLoading(false);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/goal/${goal.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-xl">{goal.title}</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-streak font-bold">
              <Flame className="h-5 w-5" />
              {streak}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 justify-center">
          {last7Days.map((completed, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              {completed ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleLogToday();
          }}
          disabled={loggedToday || loading}
          className="w-full"
          variant={loggedToday ? "secondary" : "default"}
        >
          {loggedToday ? "Logged Today ✓" : "Log Today"}
        </Button>
      </CardContent>
    </Card>
  );
}
