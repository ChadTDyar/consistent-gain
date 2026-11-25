import {
  COACH_PREMIUM_CHECK_FAILED,
  COACH_PREMIUM_REQUIRED,
} from "../../supabase/functions/coach-chat/premium-gate";

export type CoachErrorAction =
  | { kind: "upgrade"; message: string }
  | { kind: "retry"; message: string }
  | { kind: "none" };

/** Maps a coach-chat error response to what the Coach UI should show. */
export function coachErrorAction(status: number, body: unknown): CoachErrorAction {
  const code = (body as { code?: unknown } | null)?.code;
  const serverMessage = (body as { error?: unknown } | null)?.error;
  if (status === 403 && code === COACH_PREMIUM_REQUIRED) {
    return {
      kind: "upgrade",
      message: typeof serverMessage === "string" ? serverMessage : "The AI Coach is included with Premium.",
    };
  }
  if (status === 503 && code === COACH_PREMIUM_CHECK_FAILED) {
    return {
      kind: "retry",
      message: typeof serverMessage === "string" ? serverMessage : "Please try again in a moment.",
    };
  }
  return { kind: "none" };
}
