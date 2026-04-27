import { describe, it, expect } from "vitest";
import { buildFunnelCsv } from "./AdminUpgradeWallFunnel";

// Small helper to build the Pivot shape inline (mirrors the internal layout)
function p() {
  const cells = new Map<string, { dismissed: number; ctaClicked: number }>();
  const rowTotals = new Map<string, { dismissed: number; ctaClicked: number }>();
  const colTotals = new Map<string, { dismissed: number; ctaClicked: number }>();

  // coach × pro: 4 dismissed, 1 CTA  →  rate 0.2000
  cells.set("coach::pro", { dismissed: 4, ctaClicked: 1 });
  // streak_repair × premium: 2 dismissed, 3 CTA  →  rate 0.6000
  cells.set("streak_repair::premium", { dismissed: 2, ctaClicked: 3 });
  // empty cell — should be skipped in CSV
  cells.set("coach::premium", { dismissed: 0, ctaClicked: 0 });

  rowTotals.set("coach", { dismissed: 4, ctaClicked: 1 });
  rowTotals.set("streak_repair", { dismissed: 2, ctaClicked: 3 });
  colTotals.set("pro", { dismissed: 4, ctaClicked: 1 });
  colTotals.set("premium", { dismissed: 2, ctaClicked: 3 });

  return {
    gates: ["coach", "streak_repair"],
    tiers: ["premium", "pro"],
    cells,
    rowTotals,
    colTotals,
    grandTotal: { dismissed: 6, ctaClicked: 4 },
  };
}

describe("buildFunnelCsv", () => {
  it("emits header + cell + totals rows and skips empty cells", () => {
    const csv = buildFunnelCsv(p());
    const lines = csv.trim().split("\r\n");

    expect(lines[0]).toBe("scope,gate,tier,dismissed,cta_clicked,total,cta_rate");

    // Cells (only non-empty)
    expect(lines).toContain("cell,coach,pro,4,1,5,0.2000");
    expect(lines).toContain("cell,streak_repair,premium,2,3,5,0.6000");
    // Empty cell is skipped
    expect(csv).not.toContain("cell,coach,premium,");

    // Per-gate row totals
    expect(lines).toContain("gate_total,coach,*,4,1,5,0.2000");
    expect(lines).toContain("gate_total,streak_repair,*,2,3,5,0.6000");

    // Per-tier column totals
    expect(lines).toContain("tier_total,*,premium,2,3,5,0.6000");
    expect(lines).toContain("tier_total,*,pro,4,1,5,0.2000");

    // Grand total
    expect(lines).toContain("grand_total,*,*,6,4,10,0.4000");
  });

  it("escapes commas/quotes/newlines in dimension values", () => {
    const data = p();
    data.gates = ['coach,with,commas'];
    data.tiers = ['pro "elite"'];
    data.cells = new Map([['coach,with,commas::pro "elite"', { dismissed: 1, ctaClicked: 0 }]]);
    data.rowTotals = new Map([['coach,with,commas', { dismissed: 1, ctaClicked: 0 }]]);
    data.colTotals = new Map([['pro "elite"', { dismissed: 1, ctaClicked: 0 }]]);
    data.grandTotal = { dismissed: 1, ctaClicked: 0 };

    const csv = buildFunnelCsv(data);
    expect(csv).toContain('"coach,with,commas"');
    expect(csv).toContain('"pro ""elite"""');
  });

  it("returns an empty rate (no division-by-zero) when there are no events for a slice", () => {
    const data = p();
    // Force an all-zero column total
    data.colTotals.set("pro", { dismissed: 0, ctaClicked: 0 });
    const csv = buildFunnelCsv(data);
    // Trailing comma indicates empty cta_rate field
    expect(csv).toContain("tier_total,*,pro,0,0,0,\r\n");
  });
});
