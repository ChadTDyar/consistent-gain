import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Moon, Battery } from "lucide-react";
import { toast } from "sonner";
import { WellnessFeedbackModal } from "./WellnessFeedbackModal";

interface DailyContextProps {
  onSaved?: () => void;
}

export function DailyContext({ onSaved }: DailyContextProps = {}) {
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepNotes, setSleepNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLogged, setHasLogged] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);

  useEffect(() => {
    loadTodayContext();
  }, []);

  const loadTodayContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("daily_context")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (data) {
        setSleepQuality(data.sleep_quality);
        setEnergyLevel(data.energy_level);
        setSleepNotes(data.sleep_notes || "");
        setHasLogged(true);
      }
    } catch (error) {
      console.error("Error loading context:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be signed in to save a check-in");
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // 1. Save daily wellness context
      const { error: ctxError } = await supabase
        .from("daily_context")
        .upsert({
          user_id: user.id,
          date: today,
          sleep_quality: sleepQuality,
          energy_level: energyLevel,
          sleep_notes: sleepNotes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });

      if (ctxError) throw ctxError;

      // 2. Log an activity entry so the check-in counts toward streak,
      //    progress charts, and the onboarding "first check-in" step.
      //    Clear any existing daily_checkin row for today first to keep
      //    saves idempotent.
      await supabase
        .from("activity_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("completed_at", today)
        .eq("session_type", "daily_checkin");

      const { error: logError } = await supabase
        .from("activity_logs")
        .insert({
          user_id: user.id,
          goal_id: null,
          completed_at: today,
          session_type: "daily_checkin",
          rpe_rating: energyLevel,
          notes: sleepNotes || null,
        });

      if (logError) throw logError;

      setHasLogged(true);
      toast.success("Check-in saved");
      onSaved?.();
      // Broadcast so other panels (Dashboard streak, Progress tab) refresh.
      window.dispatchEvent(new CustomEvent("checkin-saved"));
      setShowWellnessModal(true);
    } catch (error: any) {
      console.error("Error saving check-in:", error);
      toast.error(error?.message || "Failed to save check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleWellnessRating = (rating: number) => {
    toast.success(`Wellness check complete! Feeling ${rating}/5`);
    setShowWellnessModal(false);
  };

  const StarRating = ({ 
    value, 
    onChange, 
    icon: Icon, 
    label 
  }: { 
    value: number | null; 
    onChange: (val: number) => void; 
    icon: any; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`min-h-[44px] min-w-[44px] rounded-full border-2 transition-all touch-manipulation ${
              value && rating <= value
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            aria-label={`Rate ${rating} out of 5`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );

  if (hasLogged) {
    return (
      <Card className="border-border">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            ✓ Daily check-in complete. Come back tomorrow!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Daily Check-in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StarRating
          value={sleepQuality}
          onChange={setSleepQuality}
          icon={Moon}
          label="Sleep Quality"
        />
        
        <StarRating
          value={energyLevel}
          onChange={setEnergyLevel}
          icon={Battery}
          label="Energy Level"
        />

        <div className="space-y-2">
          <Label htmlFor="sleep-notes">Notes (optional)</Label>
          <Textarea
            id="sleep-notes"
            placeholder="Any relevant context about your sleep or recovery..."
            value={sleepNotes}
            onChange={(e) => setSleepNotes(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading || !sleepQuality || !energyLevel}
          className="w-full min-h-[44px] touch-manipulation"
        >
          {loading ? "Saving..." : "Save Check-in"}
        </Button>
      </CardContent>

      <WellnessFeedbackModal 
        open={showWellnessModal}
        onRating={handleWellnessRating}
      />
    </Card>
  );
}
