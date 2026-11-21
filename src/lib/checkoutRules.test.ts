import { describe, it, expect, beforeEach } from "vitest";
import { priceAmountForPriceId } from "./plans";
import { resolveEntitlement } from "../../supabase/functions/check-subscription/entitlement";
import { captureAttribution, readAttribution } from "./attribution";

const sub = (status: string, product: string) => ({
  status,
  items: { data: [{ price: { product }, current_period_end: 1800000000 }] },
});

describe("purchase amount from stored price ID", () => {
  it("monthly price reports 7.99", () => {
    expect(priceAmountForPriceId("price_1TFkM0L98dr6Pw0kXiu1hjbs")).toBe(7.99);
  });
  it("annual price reports 69.99", () => {
    expect(priceAmountForPriceId("price_1TNbD3L98dr6Pw0krnhh7i50")).toBe(69.99);
  });
  it("unknown or missing price reports nothing", () => {
    expect(priceAmountForPriceId("price_other")).toBeNull();
    expect(priceAmountForPriceId(null)).toBeNull();
  });
});

describe("check-subscription entitlement", () => {
  it("active Premium product grants pro", () => {
    expect(resolveEntitlement([sub("active", "prod_U3w9PqaaJVSOto")]).plan).toBe("pro");
  });
  it("trialing legacy product grants plus", () => {
    const e = resolveEntitlement([sub("trialing", "prod_U3w81PJvJRTiQQ")]);
    expect(e.plan).toBe("plus");
    expect(e.status).toBe("trialing");
  });
  it("unknown product grants nothing", () => {
    expect(resolveEntitlement([sub("active", "prod_unknown")]).plan).toBe("free");
  });
  it("canceled or past_due Premium grants nothing", () => {
    expect(resolveEntitlement([sub("canceled", "prod_U3w9PqaaJVSOto"), sub("past_due", "prod_U3w9PqaaJVSOto")]).plan).toBe("free");
  });
  it("Premium wins over legacy across subscriptions", () => {
    expect(resolveEntitlement([sub("active", "prod_U3w81PJvJRTiQQ"), sub("trialing", "prod_U3w9PqaaJVSOto")]).plan).toBe("pro");
  });
});

describe("arl_attr attribution", () => {
  beforeEach(() => sessionStorage.clear());
  it("stores UTM values and landing path once per session", () => {
    window.history.pushState({}, "", "/7-day-reset?utm_source=news&utm_medium=email&utm_campaign=nov");
    captureAttribution();
    window.history.pushState({}, "", "/pricing?utm_source=other");
    captureAttribution();
    expect(readAttribution()).toEqual({
      utm_source: "news", utm_medium: "email", utm_campaign: "nov", landing_path: "/7-day-reset",
    });
  });
});
