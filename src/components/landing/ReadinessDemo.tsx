import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Battery, HeartPulse, Flame, AlertCircle, Dumbbell } from "lucide-react";
import { scoreReadiness, RECOMMENDATION_LABEL, type ReadinessInputs } from "@/lib/readiness";

/**
 * Try-it version of the daily check-in for the landing page. Same six
 * questions, same labels and the same scoring module as the in-app
 * ReadinessCheckIn. Nothing is saved and nothing leaves the browser.
 */
const FIELDS: { key: keyof ReadinessInputs; label: string; icon: typeof Moon; low: string; high: string }[] = [
  { key: "sleep", label: "Sleep quality", icon: Moon, low: "Rough night", high: "Slept well" },
  { key: "energy", label: "Energy today", icon: Battery, low: "Running on empty", high: "Ready to go" },
  { key: "recovery", label: "Recovery from last session", icon: HeartPulse, low: "Still feeling it", high: "Fully recovered" },
  { key: "soreness", label: "Soreness", icon: Flame, low: "A lot", high: "None" },
  { key: "pain", label: "Pain or discomfort", icon: AlertCircle, low: "Yes, notable", high: "None" },
  { key: "desire", label: "Want to train today?", icon: Dumbbell, low: "Not really", high: "Yes" },
];

const START: ReadinessInputs = { sleep: 3, energy: 3, recovery: 3, soreness: 3, pain: 5, desire: 3 };

export function ReadinessDemo() {
  const [values, setValues] = useState<ReadinessInputs>(START);
  const result = scoreReadiness(values);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Daily check-in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Try it. Tap a number on any row and watch today's plan change. Nothing here is saved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map((field) => {
            const Icon = field.icon;
            const value = values[field.key];
            return (
              <div key={field.key} className="space-y-2" role="group" aria-label={field.label}>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {field.label}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setValues((v) => ({ ...v, [field.key]: rating }))}
                      className={`min-h-[44px] min-w-[44px] rounded-full border-2 transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        rating <= value
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
                <p className="flex justify-between text-xs text-muted-foreground max-w-[236px]">
                  <span>{field.low}</span>
                  <span>{field.high}</span>
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/30 lg:sticky lg:top-24" aria-live="polite">
        <CardHeader>
          <CardTitle className="text-lg">Today's plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">
            {RECOMMENDATION_LABEL[result.recommendation]}
          </p>
          <p className="text-base font-semibold text-foreground">{result.headline}</p>
          <p className="text-sm text-muted-foreground">{result.detail}</p>
          <p className="text-xs text-muted-foreground pt-3 border-t border-border mt-3">
            This is the same scoring the app uses: a plain average of your six answers, with one rule on
            top. Notable pain never returns a full workout. It is not a diagnosis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
