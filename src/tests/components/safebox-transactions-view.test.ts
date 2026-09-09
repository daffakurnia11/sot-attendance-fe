import { describe, expect, it } from "vitest";

import { groupSafeboxTransactions } from "@/components/organisms/safebox-stock/safebox-transactions-view";

const base = {
  safebox: "public" as const,
  action: "deposit" as const,
  reason: "Bulk restock",
  actor_name: "Ken",
  actor_username: "deltakilo11",
  created_at: "2026-09-09T02:30:00Z",
  quantity_before: 1,
  quantity_after: 2,
  delta: 1,
};

describe("groupSafeboxTransactions", () => {
  it("combines item rows created by one bulk stock transaction", () => {
    const groups = groupSafeboxTransactions([
      { ...base, id: 2, item_key: "iron", item_name: "Iron" },
      { ...base, id: 1, item_key: "copper", item_name: "Copper" },
      { ...base, id: 3, item_key: "rubber", item_name: "Rubber", reason: "Separate restock" },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].map((entry) => entry.item_name)).toEqual(["Iron", "Copper"]);
    expect(groups[1].map((entry) => entry.item_name)).toEqual(["Rubber"]);
  });
});
