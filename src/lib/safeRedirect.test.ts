import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "./safeRedirect";

describe("safeRedirectPath", () => {
  it("accepts a same-site relative path", () => {
    expect(safeRedirectPath("/pricing")).toBe("/pricing");
  });
  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBeNull();
  });
  it("rejects absolute URLs", () => {
    expect(safeRedirectPath("https://evil.com/pricing")).toBeNull();
  });
  it("rejects javascript: values", () => {
    expect(safeRedirectPath("javascript:alert(1)")).toBeNull();
  });
  it("rejects backslash tricks", () => {
    expect(safeRedirectPath("/\\evil.com")).toBeNull();
  });
  it("rejects control-character tricks", () => {
    expect(safeRedirectPath("/\t/evil.com")).toBeNull();
  });
  it("returns null when missing", () => {
    expect(safeRedirectPath(null)).toBeNull();
  });
});
