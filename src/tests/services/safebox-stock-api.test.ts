import { describe, expect, it } from "vitest";

import { safeboxTransactionSchema, transactSafeboxStock } from "@/services/safebox-stock";

describe("safebox stock API", () => {
  it("sends a validated bulk transaction", async () => {
    const input = {
      safebox: "public" as const,
      action: "deposit" as const,
      idempotency_key: "0f86dcf8-820c-4d7f-864c-437f907eb547",
      reason: "restock",
      items: [{ item_key: "iron", quantity: 2 }],
    };
    const fetcher = async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(url)).toBe("http://api.test/api/v1/safebox-stock/transactions");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual(input);
      return new Response(null, { status: 204 });
    };
    await expect(
      transactSafeboxStock("http://api.test", "token", input, fetcher as typeof fetch),
    ).resolves.toBeUndefined();
  });

  it("rejects duplicate items and invalid quantities", () => {
    expect(
      safeboxTransactionSchema.safeParse({
        safebox: "public",
        action: "withdraw",
        idempotency_key: "0f86dcf8-820c-4d7f-864c-437f907eb547",
        reason: "usage",
        items: [
          { item_key: "iron", quantity: 1 },
          { item_key: "iron", quantity: 2 },
        ],
      }).success,
    ).toBe(false);
    expect(
      safeboxTransactionSchema.safeParse({
        safebox: "public",
        action: "withdraw",
        idempotency_key: "0f86dcf8-820c-4d7f-864c-437f907eb547",
        reason: "usage",
        items: [{ item_key: "iron", quantity: 0 }],
      }).success,
    ).toBe(false);
    expect(
      safeboxTransactionSchema.safeParse({
        safebox: "public",
        action: "deposit",
        idempotency_key: "not-a-uuid",
        reason: "restock",
        items: [{ item_key: "iron", quantity: 1 }],
      }).success,
    ).toBe(false);
  });
});
