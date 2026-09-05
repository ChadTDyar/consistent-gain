import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import { logMinimumViableDay } from "@/lib/streakRepair";
import type { Recommendation } from "@/lib/readiness";

const DURATIONS = [5, 10, 20] as const;

interface MinimumViableDayProps {
  /** Refresh streak state after a session is logged. */
  onLogged: () => void;
  /**
   * Today's readiness recommendation, if the user has checked in. A rest day
   * hides this card entirely — resting is the plan, not a session to nudge on
   * top of it. A mobility or reduced day highlights the matching duration.
   */
  recommendation?: Recommendation | null;
}

const SUGGESTED_MINUTES: Partial<Record<Recommendation, (typeof DURATIONS)[number]>> = {
  mobility: 5,
  reduced: 10,
};

/**
 * Minimum viable day. Sits under the habit list so a user with almost no time
 * can still log a real (short) session instead of skipping the day entirely.
 */
export function MinimumViableDay({ onLogged, recommendation }: MinimumViableDayProps) {
  const [busy, setBusy] = useState<number | null>(null);
  const [done, setDone] = useState<number | null>(null);

  // A rest day is the plan working. Don't nudge a microblock session on top of it.
  if (recommendation === "rest") return null;

  const suggested = recommendation ? SUGGESTED_MINUTES[recommendation] : undefined;

  const handleLog = async (minutes: number) => {
    setBusy(minutes);
    const result = await logMinimumViableDay(minutes);
    setBusy(null);

    if (!result.ok) {
      toast.error(result.error ?? "Could not log that session");
      return;
    }

    try {
      posthog.capture("minimum_viable_day_logged", { duration_minutes: minutes });
    } catch {
      /* analytics is best-effort */
    }

    setDone(minutes);
    toast.success(`${minutes} minutes logged. Day counted.`);
    onLogged();
    setTimeout(() => setDone(null), 4000);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <Timer className="h-5 w-5 text-primary" aria-hidden="true" />
          Short on time today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {suggested
            ? `A short session still counts. ${suggested} minutes matches today's plan, or pick what you actually have.`
            : "A short session still counts. Pick what you actually have and keep the day alive."}
        </p>
        <div className="flex gap-2">
          {DURATIONS.map((minutes) => (
            <Button
              key={minutes}
              variant={minutes === suggested ? "default" : "secondary"}
              className="min-h-[44px] flex-1 font-semibold"
              onClick={() => handleLog(minutes)}
              disabled={busy !== null}
              aria-label={`Log a ${minutes} minute session${minutes === suggested ? " (recommended)" : ""}`}
            >
              {busy === minutes ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                `${minutes} min`
              )}
            </Button>
          ))}
        </div>
        {done !== null && (
          <p className="flex items-center gap-2 text-sm font-medium text-success animate-fade-in">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            {done}-minute session logged.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
