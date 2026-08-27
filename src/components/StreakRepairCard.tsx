import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import {
  loadRepairState,
  repairMissedDay,
  type RepairState,
} from "@/lib/streakRepair";

const DURATIONS = [5, 10, 20] as const;

interface StreakRepairCardProps {
  /** Called after a successful repair so the dashboard can refresh streaks. */
  onRepaired: () => void;
  /** Bump this to force a re-check (e.g. after a habit is logged). */
  refreshKey?: number;
}

/**
 * The signature "life happens" moment. Rendered inline on the dashboard,
 * directly under the habit list, only when the user has a single missed day
 * still inside the 48-hour repair window.
 */
export function StreakRepairCard({ onRepaired, refreshKey = 0 }: StreakRepairCardProps) {
  const [state, setState] = useState<RepairState | null>(null);
  const [busy, setBusy] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [repaired, setRepaired] = useState(false);

  useEffect(() => {
    let active = true;
    loadRepairState().then((s) => {
      if (active) setState(s);
    });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (state?.repairable) {
      try {
        posthog.capture("streak_repair_offered", {
          streak_length: state.streakAtRisk,
          hours_remaining: state.hoursRemaining,
          tokens_available: state.tokensAvailable,
        });
      } catch {
        /* analytics is best-effort */
      }
    }
  }, [state?.repairable]);

  const runRepair = async (method: "makeup_session" | "grace_token", minutes?: number) => {
    if (!state?.missedDate) return;
    setBusy(true);
    const result = await repairMissedDay({
      missedDate: state.missedDate,
      method,
      durationMinutes: minutes,
    });
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error ?? "Could not repair your streak");
      return;
    }

    try {
      posthog.capture("streak_repaired", {
        method,
        duration_minutes: minutes ?? null,
        streak_length: state.streakAtRisk,
      });
    } catch {
      /* analytics is best-effort */
    }

    setRepaired(true);
    toast.success("Streak repaired. Nothing lost.");
    onRepaired();
  };

  if (!state?.repairable && !repaired) return null;

  if (repaired) {
    return (
      <Card className="border-success/40 bg-success/5">
        <CardContent className="flex items-center gap-3 py-4">
          <Heart className="h-5 w-5 text-success flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            Streak repaired. You picked it back up, that is the whole point.
          </p>
        </CardContent>
      </Card>
    );
  }

  const missedLabel = state!.missedDate
    ? new Date(`${state!.missedDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Card className="border-2 border-primary/30 bg-card shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            Repair your {state!.streakAtRisk}-day streak
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {state!.hoursRemaining}h left
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          You missed {missedLabel}. That day is still fixable for the next{" "}
          {state!.hoursRemaining} hours. Do a short makeup session
          {state!.tokensAvailable > 0 ? " or spend a grace token" : ""}, and your streak
          carries on.
        </p>

        {!choosing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="min-h-[44px] flex-1"
              onClick={() => setChoosing(true)}
              disabled={busy}
            >
              Do a makeup session
            </Button>
            {state!.tokensAvailable > 0 && (
              <Button
                variant="outline"
                className="min-h-[44px] flex-1"
                onClick={() => runRepair("grace_token")}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Use a grace token ({state!.tokensAvailable})
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">How long do you have?</p>
            <div className="flex gap-2">
              {DURATIONS.map((minutes) => (
                <Button
                  key={minutes}
                  variant="secondary"
                  className="min-h-[44px] flex-1"
                  onClick={() => runRepair("makeup_session", minutes)}
                  disabled={busy}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px]"
              onClick={() => setChoosing(false)}
              disabled={busy}
            >
              Back
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          You earn one grace token for every 7 days you log.
        </p>
      </CardContent>
    </Card>
  );
}
