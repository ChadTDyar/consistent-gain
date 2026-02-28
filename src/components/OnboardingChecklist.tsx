import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Rocket } from "lucide-react";

interface OnboardingChecklistProps {
  hasGoals: boolean;
  hasCheckin: boolean;
  onCreateGoal: () => void;
}

const steps = [
  { key: "goal", label: "Choose 1–3 realistic habits", sublabel: "What do you want to show up for daily?" },
  { key: "schedule", label: "Set your schedule & reminders", sublabel: "Pick days and a time that fits your life" },
  { key: "checkin", label: "Complete your first check-in", sublabel: "Tap 'Done' on any habit — that's it!" },
];

export const OnboardingChecklist = ({ hasGoals, hasCheckin, onCreateGoal }: OnboardingChecklistProps) => {
  const completed = [hasGoals, hasGoals, hasCheckin];
  const allDone = completed.every(Boolean);

  if (allDone) return null;

  return (
    <Card className="border-2 border-primary/30 shadow-lg mb-8 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Rocket className="h-5 w-5 text-primary" />
          Get started in under 5 minutes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete these steps to build your first streak today.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => {
          const done = completed[i];
          return (
            <button
              key={step.key}
              onClick={!done && (i === 0 || i === 1) ? onCreateGoal : undefined}
              className={`flex items-start gap-3 w-full text-left p-3 rounded-lg transition-colors ${
                done ? "bg-success/10" : "bg-card hover:bg-muted cursor-pointer"
              }`}
              disabled={done}
            >
              {done ? (
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.sublabel}</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
