import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PREMIUM_HISTORY_DAYS, PREMIUM_HISTORY_LABEL, getHistoryDays } from "./plans";

const ROOT = join(__dirname, "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|html|txt)$/.test(name) && !/\.test\./.test(name)) out.push(p);
  }
  return out;
}

describe("Premium history promise", () => {
  it("Premium has no plan limit but the view is capped at PREMIUM_HISTORY_DAYS", () => {
    expect(getHistoryDays("pro")).toBeNull();
    expect(PREMIUM_HISTORY_DAYS).toBe(365);
    expect(PREMIUM_HISTORY_LABEL).toBe("365 days of history");
  });

  it("no source, index.html or public file promises unlimited or full history", () => {
    const files = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "public")), join(ROOT, "index.html")];
    const offenders = files.filter((f) => /unlimited history|full history/i.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("static files that cannot import the constant state the same number", () => {
    for (const f of ["index.html", "public/llms.txt", "public/seo/habit-tracking-app.html"]) {
      expect(readFileSync(join(ROOT, f), "utf8")).toContain(`${PREMIUM_HISTORY_DAYS} days of history`);
    }
  });
});
