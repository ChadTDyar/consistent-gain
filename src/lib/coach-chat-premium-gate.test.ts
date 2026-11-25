import { describe, expect, it } from "vitest";
import {
  COACH_PREMIUM_CHECK_FAILED,
  COACH_PREMIUM_REQUIRED,
  coachAccessDenial,
} from "../../supabase/functions/coach-chat/premium-gate";
import { coachErrorAction } from "./coachErrors";

describe("coach-chat premium gate (server)", () => {
  it("lets a Premium user through", () => {
    expect(coachAccessDenial({ is_premium: true })).toBeNull();
  });

  it("blocks a free user with 0 messages allowed: 403 + stable code", () => {
    const d = coachAccessDenial({ is_premium: false });
    expect(d?.status).toBe(403);
    expect(d?.body.code).toBe(COACH_PREMIUM_REQUIRED);
    expect(d?.body.premiumRequired).toBe(true);
    expect(d?.body.error).toMatch(/Premium/);
  });

  it("fails closed when is_premium is null or the profile is missing", () => {
    expect(coachAccessDenial({ is_premium: null })?.body.code).toBe(COACH_PREMIUM_REQUIRED);
    expect(coachAccessDenial(null)?.body.code).toBe(COACH_PREMIUM_REQUIRED);
    expect(coachAccessDenial(undefined)?.status).toBe(403);
  });

  it("fails closed on a profile lookup error, even if a stale profile says premium", () => {
    const d = coachAccessDenial({ is_premium: true }, new Error("db down"));
    expect(d?.status).toBe(503);
    expect(d?.body.code).toBe(COACH_PREMIUM_CHECK_FAILED);
  });
});

describe("coach error mapping (UI)", () => {
  it("premium-required response shows an upgrade prompt with the server message", () => {
    const d = coachAccessDenial({ is_premium: false })!;
    expect(coachErrorAction(d.status, d.body)).toEqual({ kind: "upgrade", message: d.body.error });
  });

  it("premium-check-failed response shows a retry message", () => {
    const d = coachAccessDenial(null, new Error("x"))!;
    expect(coachErrorAction(d.status, d.body).kind).toBe("retry");
  });

  it("unrelated errors are left to the existing handling", () => {
    expect(coachErrorAction(429, {}).kind).toBe("none");
    expect(coachErrorAction(403, { code: "other" }).kind).toBe("none");
    expect(coachErrorAction(500, null).kind).toBe("none");
  });
});
