import posthog from "posthog-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lifecycle-marketing instrumentation. PostHog capture only — events reach the
 * central store via the posthog-webhook relay, so no direct Supabase writes here.
 */

/** Fire after a habit row is successfully created. Best-effort, never throws. */
export const captureHabitAdded = async (userId: string) => {
  try {
    const { count } = await supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    posthog.capture("habit_added", { habit_count: count ?? undefined });
  } catch {
    // Best-effort analytics only.
  }
};

/** Fire once when a streak of 3+ days breaks. Deduped per habit + break point. */
export const captureStreakBroken = (
  goalId: string,
  streakLength: number,
  habitName?: string,
  breakKey?: string,
) => {
  if (streakLength < 3) return;
  const key = `mf_streak_broken_${goalId}_${breakKey ?? ""}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    // localStorage unavailable — fall through and capture anyway.
  }
  try {
    posthog.capture("streak_broken", {
      streak_length: streakLength,
      habit_name: habitName,
    });
  } catch {
    // Best-effort analytics only.
  }
};
