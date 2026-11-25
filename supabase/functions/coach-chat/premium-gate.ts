// supabase/functions/coach-chat/premium-gate.ts
//
// The AI Coach is a Premium feature. The app UI already locks it for free
// users; this is the same rule on the server so a direct call to the
// function cannot reach the AI. Premium status comes from profiles.is_premium,
// the field this function has always read (written by stripe-webhook,
// check-subscription and the RevenueCat path).
//
// Kept free of Deno imports so vitest can import it (see
// src/lib/coach-chat-premium-gate.test.ts).

export const COACH_PREMIUM_REQUIRED = "coach_premium_required" as const;
export const COACH_PREMIUM_CHECK_FAILED = "coach_premium_check_failed" as const;

export type CoachGateCode =
  | typeof COACH_PREMIUM_REQUIRED
  | typeof COACH_PREMIUM_CHECK_FAILED;

export interface CoachGateDenial {
  status: number;
  body: { code: CoachGateCode; error: string; premiumRequired: boolean };
}

/**
 * Returns null when the user may use the Coach, or the response to send.
 * Fails closed: a missing profile or a lookup error never reaches the AI.
 */
export function coachAccessDenial(
  profile: { is_premium?: boolean | null } | null | undefined,
  profileError?: unknown,
): CoachGateDenial | null {
  if (profileError) {
    return {
      status: 503,
      body: {
        code: COACH_PREMIUM_CHECK_FAILED,
        error: "We couldn't confirm your plan just now. Please try again in a moment.",
        premiumRequired: false,
      },
    };
  }
  if (profile?.is_premium === true) return null;
  return {
    status: 403,
    body: {
      code: COACH_PREMIUM_REQUIRED,
      error: "The AI Coach is included with Premium.",
      premiumRequired: true,
    },
  };
}
