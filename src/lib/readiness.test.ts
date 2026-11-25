import { describe, it, expect } from "vitest";
import { scoreReadiness, SEVERE_BODY_NOTE, type ReadinessInputs } from "./readiness";

const best: ReadinessInputs = { energy: 5, recovery: 5, soreness: 5, pain: 5, sleep: 5, desire: 5 };

describe("scoreReadiness safety overrides", () => {
  it("all-best inputs still give a full workout (baseline)", () => {
    expect(scoreReadiness(best).recommendation).toBe("full");
  });

  it("highest pain with every other input at best routes to mobility, never a workout", () => {
    const r = scoreReadiness({ ...best, pain: 1 });
    expect(r.recommendation).toBe("mobility");
    expect(r.painFlag).toBe(true);
    expect(r.detail).toContain(SEVERE_BODY_NOTE);
    expect(r.detail.toLowerCase()).toContain("clinician");
  });

  it("highest soreness with every other input at best routes to mobility, never a workout", () => {
    const r = scoreReadiness({ ...best, soreness: 1 });
    expect(r.recommendation).toBe("mobility");
    expect(r.detail).toContain(SEVERE_BODY_NOTE);
  });

  it("highest pain never yields full or reduced across every other input combination", () => {
    const vals = [1, 2, 3, 4, 5];
    for (const energy of vals)
      for (const recovery of vals)
        for (const soreness of vals)
          for (const sleep of vals)
            for (const desire of vals) {
              const r = scoreReadiness({ energy, recovery, soreness, pain: 1, sleep, desire });
              expect(["mobility", "rest"]).toContain(r.recommendation);
            }
  });

  it("highest pain with a low overall score can still be a rest day", () => {
    const r = scoreReadiness({ energy: 1, recovery: 1, soreness: 1, pain: 1, sleep: 1, desire: 1 });
    expect(r.recommendation).toBe("rest");
    expect(r.detail).toContain(SEVERE_BODY_NOTE);
  });

  it("notable but not highest pain (2) never yields a full workout", () => {
    const r = scoreReadiness({ ...best, pain: 2 });
    expect(r.recommendation).not.toBe("full");
  });
});
