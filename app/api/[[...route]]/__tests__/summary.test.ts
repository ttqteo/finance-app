import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/lib/supabase/hono", () => ({
  getUser: async () => ({ id: "user-1" }),
  getSupabase: () => ({ rpc }),
}));

import app from "@/app/api/[[...route]]/summary";

const EMPTY = {
  current: { income: 0, expenses: 0, remaining: 0 },
  last: { income: 0, expenses: 0, remaining: 0 },
  categories: [],
  days: [],
};

describe("GET /api/summary", () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ data: EMPTY, error: null });
  });

  it("treats an empty accountId as no account filter", async () => {
    // The client sends `accountId=` whenever no account is picked, which is the
    // default. `summary()` only skips the filter on NULL, so passing the empty
    // string through matched `account_id = ''` — no rows — and the overview
    // showed 0 for income, expenses and remaining for everyone.
    const res = await app.request("/?from=&to=&accountId=");

    expect(res.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "summary",
      expect.objectContaining({ p_account_id: null })
    );
  });

  it("still filters when an account is picked", async () => {
    await app.request("/?accountId=acc_1");

    expect(rpc).toHaveBeenCalledWith(
      "summary",
      expect.objectContaining({ p_account_id: "acc_1" })
    );
  });
});
