import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Heart } from "lucide-react";
import { toast } from "sonner";
import { WellnessFeedbackModal } from "./WellnessFeedbackModal";

interface MicroblockTemplate {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  intensity_level: "low" | "medium" | "high";
  exercises: string[];
}

interface MicroblockSuggestionProps {
  onComplete: () => void;
}

export function MicroblockSuggestion({ onComplete }: MicroblockSuggestionProps) {
  const [template, setTemplate] = useState<MicroblockTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    loadSuggestedMicroblock();
  }, []);

  const loadSuggestedMicroblock = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get last activity to determine intensity
      const { data: lastActivity } = await supabase
        .from("activity_logs")
        .select("rpe_rating, intensity_level, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get today's context
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyContext } = await supabase
        .from("daily_context")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      // Determine suggested intensity based on context
      let suggestedIntensity: MicroblockTemplate["intensity_level"] = 'medium';
      if (dailyContext?.energy_level && dailyContext.energy_level <= 2) {
        suggestedIntensity = 'low';
      } else if (lastActivity?.rpe_rating && lastActivity.rpe_rating >= 8) {
        suggestedIntensity = 'low'; // Recovery mode
      } else if (!lastActivity) {
        suggestedIntensity = 'low'; // First session
      }

      // Fetch appropriate template
      const { data: templates } = await supabase
        .from("microblock_templates")
        .select("*")
        .eq("intensity_level", suggestedIntensity)
        .limit(1);

      if (templates && templates.length > 0) {
        const t = templates[0] as any;
        setTemplate({
          id: t.id,
          title: t.title,
          description: t.description,
          duration_minutes: t.duration_minutes,
          intensity_level: t.intensity_level,
          exercises: Array.isArray(t.exercises) ? t.exercises : [],
        });
      }
    } catch (error) {
      console.error("Error loading microblock:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = () => {
    setShowFeedbackModal(true);
  };

  const handleRating = async (rating: number) => {
    setShowFeedbackModal(false);
    setCompleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !template) return;

      // Find any goal to attach this microblock log to (required by schema)
      const { data: goal } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!goal?.id) {
        toast.error("Create a goal first to log sessions");
        setCompleting(false);
        return;
      }

      const { error } = await supabase.from("activity_logs").insert({
        user_id: user.id,
        goal_id: goal.id,
        completed_at: new Date().toISOString().split('T')[0],
        session_type: 'microblock',
        duration_minutes: template.duration_minutes,
        intensity_level: template.intensity_level,
        rpe_rating: rating,
        notes: `Completed: ${template.title}`
      } as any);

      if (error) throw error;

      toast.success("Microblock completed! 🎉");
      onComplete();
    } catch (error) {
      console.error("Error logging microblock:", error);
      toast.error("Failed to log session");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!template) return null;

  const intensityColors = {
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  } as const;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {template.title}
            </CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
          <Badge className={intensityColors[template.intensity_level]}>
            {template.intensity_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{template.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>Joint-friendly</span>
          </div>
        </div>

        {showExercises && (
          <div className="space-y-2 p-4 bg-background/50 rounded-lg">
            <p className="text-sm font-semibold">Exercises:</p>
            <ul className="space-y-1">
              {template.exercises.map((exercise, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{exercise}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowExercises(!showExercises)}
          >
            {showExercises ? "Hide" : "View"} Exercises
          </Button>
        </div>

        <Button
          onClick={handleMarkComplete}
          disabled={completing}
          className="w-full mt-2"
        >
          Mark as Complete
        </Button>
      </CardContent>

      <WellnessFeedbackModal 
        open={showFeedbackModal} 
        onRating={handleRating}
      />
    </Card>
  );
}
