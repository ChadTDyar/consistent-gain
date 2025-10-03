import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flame, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  completed_at: string;
  notes: string | null;
}

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoal();
    loadLogs();
  }, [id]);

  const loadGoal = async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Goal not found");
      navigate("/dashboard");
      return;
    }

    setGoal(data);
    setLoading(false);
  };

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("goal_id", id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Error loading logs:", error);
      return;
    }

    setLogs(data || []);
    calculateStreak(data || []);
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

  const handleDeleteGoal = async () => {
    if (!confirm("Are you sure you want to delete this goal? This cannot be undone.")) {
      return;
    }

    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete goal");
    } else {
      toast.success("Goal deleted");
      navigate("/dashboard");
    }
  };

  const renderCalendar = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const hasLog = logs.some((log) =>
            isSameDay(new Date(log.completed_at), day)
          );
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm
                ${hasLog ? "bg-success text-success-foreground font-semibold" : "bg-muted"}
                ${isToday ? "ring-2 ring-primary" : ""}
              `}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goal) return null;

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
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">{goal.description}</p>
              )}
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGoal}
              className="shadow-sm hover:shadow-md w-full md:w-auto"
            >
              <Trash2 className="h-4 w-4 md:mr-2" />
              <span className="md:inline hidden">Delete</span>
            </Button>
          </div>

          <Card className="border-none shadow-lg bg-gradient-to-br from-success/10 to-primary/5">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Flame className="h-10 w-10 text-streak flame-pulse" />
                <CardTitle className="text-4xl md:text-5xl font-display font-bold text-foreground">
                  {streak}
                </CardTitle>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                {streak === 1 ? "day" : "days"} and counting!
              </p>
              <CardDescription className="text-base mt-2">
                Keep it going! Log your activity every day to maintain your streak.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">
                Activity Calendar - {format(new Date(), "MMMM yyyy")}
              </CardTitle>
              <CardDescription className="text-base">Your activity for this month</CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">{renderCalendar()}</CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-display font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-base">Your last 10 check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground text-base">
                    No activity logged yet. Start by logging your first check-in!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        {format(new Date(log.completed_at), "MMMM d, yyyy")}
                      </span>
                      {log.notes && (
                        <span className="text-sm text-muted-foreground mt-1 sm:mt-0">{log.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
