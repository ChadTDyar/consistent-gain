import { Check, X, Wrench } from "lucide-react";

const days = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Homepage section 5: how a single missed day is handled. The copy mirrors
 * src/lib/streakRepair.ts (48-hour window, one missed day, makeup session or
 * grace token, one token per 7 logged days).
 */
export function StreakRepairDemo() {
  return (
    <section className="py-16 md:py-24 bg-background-cream">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Miss a day. Keep the streak.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miss a single day and Momentum offers a repair the next day. Do a 5, 10 or 20 minute makeup
            session, or spend a grace token. You earn one token for every 7 days you log.
          </p>
        </div>

        <p className="text-xs font-medium text-muted-foreground text-right mb-2">Example week</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              A typical streak counter
            </p>
            <div className="flex gap-2" aria-hidden="true">
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
            <p className="text-sm font-semibold text-foreground">
              Five days logged, Saturday missed. Streak back to zero.
            </p>
          </div>

          <div className="rounded-xl border-2 border-primary/30 bg-card p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Momentum</p>
            <div className="flex gap-2" aria-hidden="true">
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
                  {i === 5 && <Wrench className="h-3 w-3 mt-0.5" />}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-foreground">
              Five days logged, Saturday missed. Repair it on Sunday and the streak carries on.
            </p>
          </div>
        </div>

        <ul className="mt-8 max-w-2xl mx-auto space-y-2 text-muted-foreground text-sm md:text-base list-disc pl-5">
          <li>The repair window closes 48 hours after the missed day begins.</li>
          <li>It covers one missed day. Miss two in a row and the streak restarts, with no lecture.</li>
          <li>Short on time on a normal day? Log a 5, 10 or 20 minute session and the day counts.</li>
        </ul>
      </div>
    </section>
  );
}
