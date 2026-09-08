import { z } from "zod";

import { createRouteFetcher } from "@/lib/route-fetcher";

const stockGroupSchema = z.enum(["crafting", "ammo", "body_drugs", "weapon", "blueprint"]);
const stockItemSchema = z.object({
  safebox: z.enum(["public", "boss"]),
  item_key: z.string().min(1),
  name: z.string().min(1),
  stock_group: stockGroupSchema,
  quantity: z.number().int().nonnegative(),
});

export const safeboxStockSchema = z.object({ items: z.array(stockItemSchema) });
export const safeboxTransactionSchema = z
  .object({
    safebox: z.enum(["public", "boss"]),
    action: z.enum(["deposit", "withdraw"]),
    idempotency_key: z.string().uuid(),
    reason: z.string().trim().min(1).max(500),
    items: z
      .array(z.object({ item_key: z.string().trim().min(1), quantity: z.number().int().positive().max(10_000) }))
      .min(1)
      .max(100),
  })
  .superRefine((value, context) => {
    const keys = new Set<string>();
    value.items.forEach((item, index) => {
      if (keys.has(item.item_key))
        context.addIssue({ code: "custom", message: "Item must be unique", path: ["items", index, "item_key"] });
      keys.add(item.item_key);
    });
  });
export type SafeboxStockItem = z.infer<typeof stockItemSchema>;
export type SafeboxStock = z.infer<typeof safeboxStockSchema>;
export type SafeboxTransaction = z.infer<typeof safeboxTransactionSchema>;
export const fetchSafeboxStockRoute = createRouteFetcher("/api/safebox-stock", safeboxStockSchema);

export async function fetchSafeboxStock(baseURL: string, accessToken: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(new URL("/api/v1/safebox-stock", baseURL), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Safebox stock API returned ${response.status}`);
  const parsed = safeboxStockSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Safebox stock API returned invalid data");
  return parsed.data;
}

export class SafeboxTransactionAPIError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function transactSafeboxStock(
  baseURL: string,
  accessToken: string,
  input: SafeboxTransaction,
  fetcher: typeof fetch = fetch,
) {
  const transaction = safeboxTransactionSchema.parse(input);
  const response = await fetcher(new URL("/api/v1/safebox-stock/transactions", baseURL), {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const parsedError = z.object({ error: z.object({ message: z.string() }) }).safeParse(payload);
    throw new SafeboxTransactionAPIError(
      parsedError.success ? parsedError.data.error.message : "Safebox transaction failed",
      response.status,
    );
  }
}
