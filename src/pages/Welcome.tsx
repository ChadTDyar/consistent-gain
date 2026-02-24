import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Heart, Moon, Zap, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";

const BODY_AREAS = [
  "Lower Back", "Knees", "Shoulders", "Hips", "Neck", "Ankles", "Wrists", "None",
] as const;

const GOAL_CATEGORIES = [
  { label: "Strength", emoji: "💪" },
  { label: "Cardio", emoji: "🏃" },
  { label: "Flexibility", emoji: "🧘" },
  { label: "Walking", emoji: "🚶" },
  { label: "Recovery", emoji: "🩹" },
  { label: "Other", emoji: "✨" },
] as const;

const STEPS = ["goal", "pain", "context", "ready"] as const;
type Step = typeof STEPS[number];

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("goal");
  const [loading, setLoading] = useState(false);

  // Goal state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState<string | null>(null);
  const [goalDays, setGoalDays] = useState(3);

  // Pain state
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Context state
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);

  const currentIndex = STEPS.indexOf(step);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  const toggleArea = (area: string) => {
    if (area === "None") {
      setSelectedAreas([]);
      return;
    }
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // 1. Create goal
      if (goalTitle.trim()) {
        await supabase.from("goals").insert({
          user_id: user.id,
          title: goalTitle.trim(),
          category: goalCategory,
          target_days_per_week: goalDays,
        });
      }

      // 2. Save pain areas
      if (selectedAreas.length > 0) {
        const painInserts = selectedAreas.map((area) => ({
          user_id: user.id,
          body_area: area,
          intensity: 1,
        }));
        await supabase.from("pain_reports").insert(painInserts);
      }

      // 3. Save daily context
      await supabase.from("daily_context").insert({
        user_id: user.id,
        sleep_quality: sleepQuality,
        energy_level: energyLevel,
      });

      toast.success("You're all set! Let's build momentum.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canAdvance = () => {
    if (step === "goal") return goalTitle.trim().length > 0 && goalCategory !== null;
    return true;
  };

  const next = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const back = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  };

  return (
    <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-none shadow-xl">
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <img src={momentumLogo} alt="Momentum" className="h-12 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Step {currentIndex + 1} of {STEPS.length}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* ── Step 1: First Goal ── */}
          {step === "goal" && (
            <div className="space-y-6 fade-in">
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">Set your first goal</CardTitle>
                <CardDescription>What fitness habit do you want to build?</CardDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal name</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g. Walk 30 minutes, Morning stretching"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setGoalCategory(cat.label)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        goalCategory === cat.label
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <span className="text-lg block mb-1">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>How many days per week? <span className="text-primary font-bold">{goalDays}</span></Label>
                <Slider
                  value={[goalDays]}
                  onValueChange={(v) => setGoalDays(v[0])}
                  min={1}
                  max={7}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Pain Areas ── */}
          {step === "pain" && (
            <div className="space-y-6 fade-in">
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">Any areas of concern?</CardTitle>
                <CardDescription>
                  Select body areas where you experience discomfort. We'll suggest joint-safe alternatives.
                </CardDescription>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {BODY_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      area === "None"
                        ? selectedAreas.length === 0
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                        : selectedAreas.includes(area)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Sleep & Energy ── */}
          {step === "context" && (
            <div className="space-y-6 fade-in">
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Moon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-display">How are you feeling today?</CardTitle>
                <CardDescription>
                  This helps us calibrate suggestions to your current state.
                </CardDescription>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <Label>Sleep quality last night: <span className="text-primary font-bold">{sleepQuality}/5</span></Label>
                  <Slider
                    value={[sleepQuality]}
                    onValueChange={(v) => setSleepQuality(v[0])}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Great</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Current energy level: <span className="text-primary font-bold">{energyLevel}/5</span></Label>
                  <Slider
                    value={[energyLevel]}
                    onValueChange={(v) => setEnergyLevel(v[0])}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Drained</span>
                    <span>Energized</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Ready ── */}
          {step === "ready" && (
            <div className="space-y-6 fade-in text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">You're ready!</CardTitle>
              <CardDescription className="text-base">
                Here's your starting setup:
              </CardDescription>

              <div className="bg-muted/50 rounded-lg p-5 text-left space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-medium text-foreground">{goalTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{goalCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days per week</span>
                  <span className="font-medium text-foreground">{goalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pain areas</span>
                  <span className="font-medium text-foreground">
                    {selectedAreas.length > 0 ? selectedAreas.join(", ") : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sleep / Energy</span>
                  <span className="font-medium text-foreground">{sleepQuality}/5 · {energyLevel}/5</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                💡 You can always adjust these from your dashboard.
              </p>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex gap-3 pt-2">
            {currentIndex > 0 && (
              <Button variant="outline" onClick={back} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            {step !== "ready" ? (
              <Button
                onClick={next}
                disabled={!canAdvance()}
                className="flex-1 btn-gradient"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 btn-gradient shadow-xl"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Let's go!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
