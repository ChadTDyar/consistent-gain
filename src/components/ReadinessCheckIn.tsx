import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Moon, Battery, HeartPulse, Flame, AlertCircle, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { WellnessFeedbackModal } from "./WellnessFeedbackModal";
import {
  scoreReadiness,
  RECOMMENDATION_LABEL,
  type ReadinessResult,
  type ReadinessInputs,
} from "@/lib/readiness";

interface ReadinessCheckInProps {
  onSaved?: (result: ReadinessResult) => void;
  /** Opens the detailed body-map pain logger. Only offered when pain is notable. */
  onWantsDetailedPainLog?: () => void;
}

type FieldKey = "sleep" | "energy" | "recovery" | "soreness" | "pain" | "desire";

const FIELDS: { key: FieldKey; label: string; icon: any; low: string; high: string }[] = [
  { key: "sleep", label: "Sleep quality", icon: Moon, low: "Rough night", high: "Slept well" },
  { key: "energy", label: "Energy today", icon: Battery, low: "Running on empty", high: "Ready to go" },
  { key: "recovery", label: "Recovery from last session", icon: HeartPulse, low: "Still feeling it", high: "Fully recovered" },
  { key: "soreness", label: "Soreness", icon: Flame, low: "A lot", high: "None" },
  { key: "pain", label: "Pain or discomfort", icon: AlertCircle, low: "Yes, notable", high: "None" },
  { key: "desire", label: "Want to train today?", icon: Dumbbell, low: "Not really", high: "Yes" },
];

type Values = Record<FieldKey, number | null>;

export function ReadinessCheckIn({ onSaved, onWantsDetailedPainLog }: ReadinessCheckInProps = {}) {
  const [values, setValues] = useState<Values>({
    sleep: null,
    energy: null,
    recovery: null,
    soreness: null,
    pain: null,
    desire: null,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [showWellnessModal, setShowWellnessModal] = useState(false);

  useEffect(() => {
    loadTodayContext();
  }, []);

  const loadTodayContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      const { data } = await (supabase.from("daily_context") as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (data && data.energy_level && data.sleep_quality) {
        setValues({
          sleep: data.sleep_quality,
          energy: data.energy_level,
          recovery: data.recovery ?? null,
          soreness: data.soreness ?? null,
          pain: data.pain ?? null,
          desire: data.desire ?? null,
        });
        if (data.recovery && data.soreness && data.pain && data.desire) {
          setResult(
            scoreReadiness({
              sleep: data.sleep_quality,
              energy: data.energy_level,
              recovery: data.recovery,
              soreness: data.soreness,
              pain: data.pain,
              desire: data.desire,
            })
          );
        }
      }
    } catch (error) {
      console.error("Error loading today's readiness check-in:", error);
    }
  };

  const allAnswered = Object.values(values).every((v) => v !== null);

  const handleSave = async () => {
    if (!allAnswered) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be signed in to save a check-in");
        return;
      }

      const inputs = values as unknown as ReadinessInputs;
      const scored = scoreReadiness(inputs);
      const today = new Date().toISOString().split("T")[0];

      const { error: ctxError } = await (supabase.from("daily_context") as any).upsert(
        {
          user_id: user.id,
          date: today,
          sleep_quality: inputs.sleep,
          energy_level: inputs.energy,
          recovery: inputs.recovery,
          soreness: inputs.soreness,
          pain: inputs.pain,
          desire: inputs.desire,
          readiness_score: scored.score,
          recommendation: scored.recommendation,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,date" }
      );

      if (ctxError) throw ctxError;

      // Keep this idempotent and keep counting today's check-in toward the
      // streak, same as the check-in did before this change.
      await supabase
        .from("activity_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("completed_at", today)
        .is("goal_id", null)
        .eq("session_type", "regular");

      const { error: logError } = await supabase.from("activity_logs").insert({
        user_id: user.id,
        goal_id: null,
        completed_at: today,
        session_type: "regular",
        rpe_rating: inputs.energy,
        notes: null,
      });

      if (logError) throw logError;

      setResult(scored);
      toast.success("Check-in saved");
      onSaved?.(scored);
      window.dispatchEvent(new CustomEvent("checkin-saved"));

      if (scored.painFlag) {
        toast("Want to log exactly where it hurts?", {
          action: {
            label: "Log location",
            onClick: () => onWantsDetailedPainLog?.(),
          },
        });
      } else {
        setShowWellnessModal(true);
      }
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

  const renderScale = (field: (typeof FIELDS)[number]) => {
    const value = values[field.key];
    const Icon = field.icon;
    return (
      <div key={field.key} className="space-y-2">
        <Label className="flex items-center gap-2">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {field.label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-muted-foreground w-24 shrink-0">
            {field.low}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setValues((v) => ({ ...v, [field.key]: rating }))}
                className={`min-h-[44px] min-w-[44px] rounded-full border-2 transition-all touch-manipulation ${
                  value !== null && rating <= value
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
                aria-label={`${field.label}: rate ${rating} out of 5`}
                aria-pressed={value === rating}
              >
                {rating}
              </button>
            ))}
          </div>
          <span className="hidden sm:inline text-xs text-muted-foreground w-24 shrink-0 text-right">
            {field.high}
          </span>
        </div>
      </div>
    );
  };

  if (result) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Today's plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-base font-semibold text-foreground">{result.headline}</p>
          <p className="text-sm text-muted-foreground">{result.detail}</p>
          <p className="text-xs text-muted-foreground pt-2">
            Recommendation: {RECOMMENDATION_LABEL[result.recommendation]}. Come back tomorrow
            for the next check-in.
          </p>
        </CardContent>

        <WellnessFeedbackModal open={showWellnessModal} onRating={handleWellnessRating} />
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Daily check-in</CardTitle>
        <p className="text-sm text-muted-foreground">
          Six quick taps. Takes less than a minute, tells you what today should look like.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {FIELDS.map((field) => renderScale(field))}

        <Button
          onClick={handleSave}
          disabled={loading || !allAnswered}
          className="w-full min-h-[44px] touch-manipulation"
        >
          {loading ? "Saving..." : "Get today's plan"}
        </Button>
      </CardContent>

      <WellnessFeedbackModal open={showWellnessModal} onRating={handleWellnessRating} />
    </Card>
  );
}
