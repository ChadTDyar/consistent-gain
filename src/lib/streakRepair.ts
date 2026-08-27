import { supabase } from "@/integrations/supabase/client";

/**
 * Streak Repair
 * -------------
 * Product defaults chosen here (flagged for review):
 *  - Repair window: 48 hours. A break is repairable while the missed day is
 *    today-1 or today-2 (i.e. the user is at most 2 days past their last log).
 *  - Only a SINGLE missed day is repairable. Two or more consecutive missed
 *    days is a real restart, not a repair.
 *  - Grace tokens: 1 token earned for every 7 completed habit-days, minus
 *    tokens already spent (rows in `streak_repairs` with a `repair_date`).
 *    Derived so no schema migration is needed.
 */

export const REPAIR_WINDOW_HOURS = 48;
export const DAYS_PER_GRACE_TOKEN = 7;

export interface RepairState {
  /** A single missed day sits inside the 48h window and can be repaired. */
  repairable: boolean;
  /** ISO date (yyyy-mm-dd) of the missed day, if repairable. */
  missedDate: string | null;
  /** Whole hours left before the repair window closes. */
  hoursRemaining: number;
  /** The streak length that is at risk (days logged before the miss). */
  streakAtRisk: number;
  /** Grace tokens the user currently has available. */
  tokensAvailable: number;
}

const toDayKey = (value: string | Date): string => {
  // Postgres DATE values arrive as "YYYY-MM-DD". `new Date("YYYY-MM-DD")`
  // parses as UTC midnight, which shifts back a day in negative-offset
  // timezones, so date-only strings are handled as plain calendar days.
  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  }
  const d = typeof value === "string" ? new Date(value) : new Date(value);
  d.setHours(0, 0, 0, 0);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Parse a "YYYY-MM-DD" day key into a local-midnight Date. */
const fromDayKey = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};


const dayMs = 24 * 60 * 60 * 1000;

/** Count of grace tokens available: earned (1 per 7 logged days) minus spent. */
export const getGraceTokens = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const [{ data: logs }, { data: repairs }] = await Promise.all([
    supabase.from("activity_logs").select("completed_at").eq("user_id", user.id),
    supabase.from("streak_repairs").select("id").eq("user_id", user.id),
  ]);

  const uniqueDays = new Set((logs ?? []).map((l) => toDayKey(l.completed_at)));
  const earned = Math.floor(uniqueDays.size / DAYS_PER_GRACE_TOKEN);
  const spent = (repairs ?? []).length;
  return Math.max(0, earned - spent);
};

/**
 * Work out whether the user has a repairable break right now.
 * Pure over the supplied logs so it stays easy to reason about and test.
 */
export const evaluateRepairState = (
  logs: Array<{ completed_at: string }>,
  tokensAvailable: number,
  now: Date = new Date()
): RepairState => {
  const empty: RepairState = {
    repairable: false,
    missedDate: null,
    hoursRemaining: 0,
    streakAtRisk: 0,
    tokensAvailable,
  };

  if (!logs || logs.length === 0) return empty;

  const days = Array.from(new Set(logs.map((l) => toDayKey(l.completed_at))))
    .sort((a, b) => fromDayKey(b).getTime() - fromDayKey(a).getTime());

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const lastLogged = fromDayKey(days[0]);

  const gap = Math.round((today.getTime() - lastLogged.getTime()) / dayMs);

  // gap 0 or 1 -> streak is intact. gap > 2 -> outside the 48h window.
  if (gap !== 2) return empty;

  // The missed day is the day right after the last logged day.
  const missed = new Date(lastLogged.getFullYear(), lastLogged.getMonth(), lastLogged.getDate() + 1);

  // How long is the run that is at risk?
  let streakAtRisk = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = fromDayKey(days[i - 1]).getTime();
    const cur = fromDayKey(days[i]).getTime();
    if (Math.round((prev - cur) / dayMs) === 1) streakAtRisk++;
    else break;
  }


  // Window closes at the end of the day after the missed day.
  const windowCloses = new Date(missed.getTime() + REPAIR_WINDOW_HOURS * 60 * 60 * 1000);
  const hoursRemaining = Math.max(
    0,
    Math.floor((windowCloses.getTime() - now.getTime()) / (60 * 60 * 1000))
  );

  return {
    repairable: hoursRemaining > 0,
    missedDate: toDayKey(missed),
    hoursRemaining,
    streakAtRisk,
    tokensAvailable,
  };
};

/** Load logs + tokens and evaluate in one call. */
export const loadRepairState = async (): Promise<RepairState> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { repairable: false, missedDate: null, hoursRemaining: 0, streakAtRisk: 0, tokensAvailable: 0 };

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const tokens = await getGraceTokens();
  return evaluateRepairState(logs ?? [], tokens);
};

/** Pick a habit to attach a repair/makeup log to. */
export const getPrimaryGoalId = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
};

export interface RepairResult {
  ok: boolean;
  error?: string;
}

/**
 * Repair the missed day.
 * `method` is either a completed makeup session (with a duration) or a grace
 * token spend. Both write a dated `activity_logs` row for the missed day so
 * the streak calculation heals, plus a `streak_repairs` audit row.
 */
export const repairMissedDay = async (opts: {
  missedDate: string;
  method: "makeup_session" | "grace_token";
  durationMinutes?: number;
  daysMissed?: number;
}): Promise<RepairResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be signed in." };

  const goalId = await getPrimaryGoalId(user.id);
  if (!goalId) return { ok: false, error: "Add a habit first, then you can repair a streak." };

  const isMakeup = opts.method === "makeup_session";

  const { error } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    goal_id: goalId,
    completed_at: opts.missedDate,
    // CHECK constraint allows only 'regular' | 'microblock'.
    session_type: isMakeup ? "microblock" : "regular",
    duration_minutes: isMakeup ? opts.durationMinutes ?? 5 : null,
    notes: isMakeup
      ? `Streak repair: ${opts.durationMinutes ?? 5}-minute makeup session`
      : "Streak repair: grace token",
  });

  if (error) return { ok: false, error: error.message };

  await supabase.from("streak_repairs").insert({
    user_id: user.id,
    days_missed: opts.daysMissed ?? 1,
    repair_date: opts.missedDate,
    repair_message: isMakeup ? "Repaired with a makeup session" : "Repaired with a grace token",
  });

  return { ok: true };
};

/** Log a short "minimum viable day" session for today. */
export const logMinimumViableDay = async (
  durationMinutes: number,
  goalId?: string
): Promise<RepairResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be signed in." };

  const targetGoal = goalId ?? (await getPrimaryGoalId(user.id));
  if (!targetGoal) return { ok: false, error: "Add a habit first, then you can log a session." };

  const today = toDayKey(new Date());

  const { error } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    goal_id: targetGoal,
    completed_at: today,
    session_type: "microblock",
    duration_minutes: durationMinutes,
    intensity_level: durationMinutes <= 5 ? "low" : durationMinutes <= 10 ? "medium" : "high",
    notes: `${durationMinutes}-minute minimum viable day`,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "You already logged that habit today." };
    return { ok: false, error: error.message };
  }

  return { ok: true };
};
