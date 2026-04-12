import { Check, X } from "lucide-react";

const days = ["M", "T", "W", "T", "F", "S", "S"];
const completedUpTo5 = [true, true, true, true, true, false, false];

export function StreakRepairDemo() {
  return (
    <section className="py-16 md:py-24 bg-background-cream">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Panel A — Other apps */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Every other habit app
            </p>
            <div className="flex gap-2">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-1 aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold ${
                    i < 5
                      ? "bg-muted text-foreground"
                      : i === 5
                      ? "bg-destructive/15 text-destructive border border-destructive/30"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span>{d}</span>
                  {i < 5 && <Check className="h-3 w-3 mt-0.5" />}
                  {i === 5 && <X className="h-3 w-3 mt-0.5" />}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-destructive">
              Streak broken. 0 days.
            </p>
          </div>

          {/* Panel B — Momentum */}
          <div className="rounded-xl border-2 border-primary/30 bg-card p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Momentum
            </p>
            <div className="flex gap-2">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-1 aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold ${
                    i < 5
                      ? "bg-primary/10 text-primary"
                      : i === 5
                      ? "bg-accent text-accent-foreground border border-primary/20"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span>{d}</span>
                  {i < 5 && <Check className="h-3 w-3 mt-0.5" />}
                  {i === 5 && <span className="text-[10px] mt-0.5">—</span>}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-primary">
              Your streak is safe until tomorrow. Pick it back up.
            </p>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm md:text-base mt-8 max-w-xl mx-auto">
          Missing a day shouldn't end everything. Momentum is built for real life.
        </p>
      </div>
    </section>
  );
}
