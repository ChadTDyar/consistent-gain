import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ tables: [] as string[], failTable: null as string | null }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      mocks.tables.push(table);
      const result = () =>
        Promise.resolve(
          table === mocks.failTable ? { data: null, error: { message: "denied" } } : { data: [{ table }], error: null },
        );
      return { select: () => ({ eq: () => Object.assign(result(), { single: result }) }) };
    },
  },
}));

import { exportUserData } from "./exportUserData";

describe("exportUserData (delete-account export, every plan)", () => {
  beforeEach(() => {
    mocks.tables = [];
    mocks.failTable = null;
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
  });

  it("reads everything deletion removes, including pain reports and coach chat", async () => {
    await exportUserData("user-1");
    expect(mocks.tables.sort()).toEqual(
      ["activity_logs", "chat_messages", "cost_tracking", "goals", "pain_reports", "profiles"],
    );
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });

  it("does not save a partial file when a read fails", async () => {
    mocks.failTable = "pain_reports";
    await expect(exportUserData("user-1")).rejects.toMatchObject({ message: "denied" });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
