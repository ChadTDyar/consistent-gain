export interface ReadinessInputs {
  energy: number;
  recovery: number;
  soreness: number;
  pain: number;
  sleep: number;
  desire: number;
}

export type Recommendation = "full" | "reduced" | "mobility" | "rest";

export interface ReadinessResult {
  score: number;
  recommendation: Recommendation;
  headline: string;
  detail: string;
  painFlag: boolean;
}

const clamp = (n: number) => Math.min(5, Math.max(1, n));

/**
 * Turns six 1-5 taps into one plain-language recommendation. This is a fixed,
 * legible weighted average — not a model, not a diagnosis. Soreness and pain
 * are entered as severity (1 = worst), so they're inverted before averaging.
 */
export function scoreReadiness(inputs: ReadinessInputs): ReadinessResult {
  const energy = clamp(inputs.energy);
  const recovery = clamp(inputs.recovery);
  const soreness = clamp(inputs.soreness);
  const pain = clamp(inputs.pain);
  const sleep = clamp(inputs.sleep);
  const desire = clamp(inputs.desire);

  const sorenessInverted = 6 - soreness;
  const painInverted = 6 - pain;

  const rawScore =
    (energy + recovery + sorenessInverted + painInverted + sleep + desire) / 6;

  const painFlag = pain <= 2; // "notable" discomfort or worse

  let recommendation: Recommendation;
  if (rawScore >= 4.0) recommendation = "full";
  else if (rawScore >= 2.8) recommendation = "reduced";
  else if (rawScore >= 1.8) recommendation = "mobility";
  else recommendation = "rest";

  // Hard override: notable pain never returns a full workout, regardless of score.
  if (painFlag && recommendation === "full") {
    recommendation = "reduced";
  }

  const COPY: Record<Recommendation, { headline: string; detail: string }> = {
    full: {
      headline: "You're ready for it. Go for the full session.",
      detail: "Energy, recovery, and sleep are all lining up today.",
    },
    reduced: {
      headline: "Take today at a lighter intensity.",
      detail: "Same plan, less volume or weight. It still counts.",
    },
    mobility: {
      headline: "Today's a mobility and recovery day.",
      detail:
        "Some easy movement and stretching keeps things loose without adding load.",
    },
    rest: {
      headline: "Today's a rest day. That's the plan working.",
      detail:
        "Your body's asking for a break. Taking it is what keeps you consistent long-term.",
    },
  };

  const copy = COPY[recommendation];

  return {
    score: Math.round(rawScore * 10) / 10,
    recommendation,
    headline: copy.headline,
    detail: painFlag
      ? `${copy.detail} Sounds like today's a day to go easy on that discomfort. If it doesn't ease up, that's worth mentioning to a doctor, not an app.`
      : copy.detail,
    painFlag,
  };
}

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  full: "Full workout",
  reduced: "Reduced workout",
  mobility: "Mobility / recovery",
  rest: "Rest day",
};
