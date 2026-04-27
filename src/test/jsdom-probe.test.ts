import { describe, it } from "vitest";
describe("jsdom probe", () => {
  it("checks", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    console.log("setPointerCapture:", typeof el.setPointerCapture);
    console.log("releasePointerCapture:", typeof el.releasePointerCapture);
    console.log("elementFromPoint:", typeof document.elementFromPoint);
    try { el.setPointerCapture(1); console.log("setPointerCapture(1) OK"); } catch (e) { console.log("setPointerCapture err:", (e as Error).message); }
    console.log("elementFromPoint(0,0):", document.elementFromPoint(0, 0));
  });
});
