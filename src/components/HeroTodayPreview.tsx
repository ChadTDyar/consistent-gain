import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Battery, HeartPulse, Flame, AlertCircle, Dumbbell } from "lucide-react";
import { scoreReadiness, RECOMMENDATION_LABEL, type ReadinessInputs } from "@/lib/readiness";
import { analytics } from "@/lib/analytics";

/**
 * Landing hero preview of the Today screen. The three sample days are fixed
 * inputs; the plan shown for each is computed live by the same readiness
 * scoring module the app uses. No network, no database, no AI calls.
 */
const SAMPLE_DAYS: { id: string; label: string; inputs: ReadinessInputs }[] = [
  { id: "rough", label: "Rough night", inputs: { sleep: 2, energy: 3, recovery: 3, soreness: 3, pain: 4, desire: 3 } },
  { id: "good", label: "Good day", inputs: { sleep: 4, energy: 4, recovery: 5, soreness: 4, pain: 5, desire: 4 } },
  { id: "worn", label: "Worn out", inputs: { sleep: 2, energy: 2, recovery: 2, soreness: 2, pain: 4, desire: 2 } },
];

const ROWS: { key: keyof ReadinessInputs; label: string; icon: typeof Moon }[] = [
  { key: "sleep", label: "Sleep quality", icon: Moon },
  { key: "energy", label: "Energy today", icon: Battery },
  { key: "recovery", label: "Recovery", icon: HeartPulse },
  { key: "soreness", label: "Soreness", icon: Flame },
  { key: "pain", label: "Pain or discomfort", icon: AlertCircle },
  { key: "desire", label: "Want to train?", icon: Dumbbell },
];

export function HeroTodayPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [dayId, setDayId] = useState(SAMPLE_DAYS[0].id);
  const day = SAMPLE_DAYS.find((d) => d.id === dayId) ?? SAMPLE_DAYS[0];
  const result = scoreReadiness(day.inputs);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      analytics.heroSampleView();
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          analytics.heroSampleView();
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md mx-auto lg:ml-auto">
      <span className="absolute -top-3 right-4 z-10 rounded-full bg-secondary text-secondary-foreground border border-border px-3 py-1 text-xs font-semibold shadow-sm">
        Sample
      </span>
      <div className="rounded-3xl border border-primary/10 bg-card shadow-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="font-display font-bold text-lg text-foreground">Today</p>
          <p className="text-xs text-muted-foreground">Daily check-in</p>
        </div>

        <div role="group" aria-label="Pick a sample day to see how the plan changes" className="flex gap-2">
          {SAMPLE_DAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDayId(d.id)}
              aria-pressed={d.id === dayId}
              className={`flex-1 min-h-[44px] rounded-full border-2 px-2 text-xs sm:text-sm font-semibold transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                d.id === dayId
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary/50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2.5">
          {ROWS.map(({ key, label, icon: Icon }) => {
            const value = day.inputs[key];
            return (
              <li key={key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-foreground min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </span>
                <span className="sr-only">{value} out of 5</span>
                <span className="flex gap-1 shrink-0" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-3.5 w-3.5 rounded-full border-2 ${
                        n <= value ? "bg-primary border-primary" : "border-muted-foreground/30"
                      }`}
                    />
                  ))}
                </span>
              </li>
            );
          })}
        </ul>

        <Card className="border-border bg-background" aria-live="polite">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Today's plan</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-1.5">
            <p className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
              {RECOMMENDATION_LABEL[result.recommendation]}
            </p>
            <p className="text-sm font-semibold text-foreground">{result.headline}</p>
            <p className="text-sm text-muted-foreground">{result.detail}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
