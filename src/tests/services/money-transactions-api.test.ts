import { describe, expect, it } from "vitest";

import { fetchMoneyTransactions } from "@/services/money-transactions";

const valid = {
  account: "office",
  current_balance: 1010000,
  balances: { office: 1010000, dirty: 18000 },
  transactions: [
    {
      id: 1,
      account: "office",
      type: "deposit",
      direction: "credit",
      amount: 10000,
      balance_before: 1000000,
      balance_after: 1010000,
      reason: "Order payment",
      actor_member_id: 7,
      actor_name: "Kenji Nakamura",
      actor_username: "deltakilo11",
      created_at: "2026-08-28T01:00:00Z",
    },
  ],
};

describe("fetchMoneyTransactions", () => {
  it("requests and validates account-scoped transaction history", async () => {
    let requestedURL = "";
    const fetcher = async (input: string | URL | Request) => {
      requestedURL = String(input);
      return new Response(JSON.stringify(valid), { status: 200 });
    };
    await expect(
      fetchMoneyTransactions("http://api.test", "token", "office", fetcher as typeof fetch),
    ).resolves.toEqual(valid);
    expect(requestedURL).toBe("http://api.test/api/v1/money-transactions/office");
  });

  it("rejects response for another account", async () => {
    const fetcher = async () => new Response(JSON.stringify({ ...valid, account: "dirty" }), { status: 200 });
    await expect(fetchMoneyTransactions("http://api.test", "token", "office", fetcher as typeof fetch)).rejects.toThrow(
      "invalid data",
    );
  });
});
