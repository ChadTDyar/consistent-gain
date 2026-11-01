import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Battery, HeartPulse, Flame, AlertCircle, Dumbbell } from "lucide-react";
import { scoreReadiness, RECOMMENDATION_LABEL, type ReadinessInputs } from "@/lib/readiness";
import { analytics } from "@/lib/analytics";

/**
 * Static, non-interactive preview of the Today screen for the landing hero.
 * Uses the real readiness scoring module with fixed sample inputs. No network,
 * no database, no AI calls.
 */
const SAMPLE: ReadinessInputs = { sleep: 2, energy: 3, recovery: 3, soreness: 3, pain: 4, desire: 3 };

const ROWS: { key: keyof ReadinessInputs; label: string; icon: typeof Moon }[] = [
  { key: "sleep", label: "Sleep quality", icon: Moon },
  { key: "energy", label: "Energy today", icon: Battery },
  { key: "recovery", label: "Recovery", icon: HeartPulse },
  { key: "soreness", label: "Soreness", icon: Flame },
  { key: "pain", label: "Pain or discomfort", icon: AlertCircle },
  { key: "desire", label: "Want to train?", icon: Dumbbell },
];

const result = scoreReadiness(SAMPLE);

export function HeroTodayPreview() {
  const ref = useRef<HTMLDivElement>(null);

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
    <div
      ref={ref}
      className="relative w-full max-w-md mx-auto lg:ml-auto pointer-events-none select-none"
      aria-label="Sample preview of the Today screen"
      role="img"
    >
      <span className="absolute -top-3 right-4 z-10 rounded-full bg-secondary text-secondary-foreground border border-border px-3 py-1 text-xs font-semibold shadow-sm">
        Sample
      </span>
      <div className="rounded-3xl border border-primary/10 bg-card shadow-2xl p-4 sm:p-5 space-y-4" aria-hidden="true">
        <div className="flex items-baseline justify-between">
          <p className="font-display font-bold text-lg text-foreground">Today</p>
          <p className="text-xs text-muted-foreground">Daily check-in</p>
        </div>

        <ul className="space-y-2.5">
          {ROWS.map(({ key, label, icon: Icon }) => {
            const value = SAMPLE[key];
            return (
              <li key={key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-foreground min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{label}</span>
                </span>
                <span className="flex gap-1 shrink-0">
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

        <Card className="border-border bg-background">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Today's plan</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-1.5">
            <p className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
              {RECOMMENDATION_LABEL[result.recommendation]}
            </p>
            <p className="text-sm font-semibold text-foreground">{result.headline}</p>
            <p className="text-sm text-muted-foreground">
              Short sleep last night. {result.detail}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
