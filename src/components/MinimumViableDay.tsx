import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import { logMinimumViableDay } from "@/lib/streakRepair";

const DURATIONS = [5, 10, 20] as const;

interface MinimumViableDayProps {
  /** Refresh streak state after a session is logged. */
  onLogged: () => void;
}

/**
 * Minimum viable day. Sits under the habit list so a user with almost no time
 * can still log a real (short) session instead of skipping the day entirely.
 */
export function MinimumViableDay({ onLogged }: MinimumViableDayProps) {
  const [busy, setBusy] = useState<number | null>(null);
  const [done, setDone] = useState<number | null>(null);

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
          A short session still counts. Pick what you actually have and keep the day alive.
        </p>
        <div className="flex gap-2">
          {DURATIONS.map((minutes) => (
            <Button
              key={minutes}
              variant="secondary"
              className="min-h-[44px] flex-1 font-semibold"
              onClick={() => handleLog(minutes)}
              disabled={busy !== null}
              aria-label={`Log a ${minutes} minute session`}
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
