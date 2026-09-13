import { z } from "zod";

import { createRouteFetcher } from "@/lib/route-fetcher";

const stockGroupSchema = z.enum([
  "crafting",
  "ammo",
  "body_drugs",
  "weapon",
  "blueprint",
  "thief_tools",
  "weapon_accessories",
]);
const stockItemSchema = z.object({
  safebox: z.enum(["public", "boss"]),
  item_key: z.string().min(1),
  name: z.string().min(1),
  stock_group: stockGroupSchema,
  quantity: z.number().int().nonnegative(),
});

export const safeboxStockSchema = z.object({ items: z.array(stockItemSchema) });
export const safeboxTransactionsSchema = z.object({
  transactions: z.array(
    z.object({
      id: z.number().int(),
      safebox: z.enum(["public", "boss"]),
      item_key: z.string(),
      item_name: z.string(),
      action: z.enum(["deposit", "withdraw", "opening", "adjustment", "correction", "reset"]),
      quantity_before: z.number().int().nonnegative(),
      quantity_after: z.number().int().nonnegative(),
      delta: z.number().int(),
      reason: z.string(),
      actor_name: z.string(),
      actor_username: z.string(),
      created_at: z.string(),
    }),
  ),
});
/** Ceiling on a balance an adjustment may set. Mirrors MaxItemQuantity in internal/stock. */
export const maxItemQuantity = 1_000_000;
/** Ceiling on a single deposit or withdraw. Mirrors MaxLineQuantity in internal/stock. */
export const maxLineQuantity = 10_000;

// A deposit or withdraw moves stock, so its quantity is a delta: positive, and
// capped per movement. An adjustment sets the balance outright, so its quantity
// is the target: zero is legitimate and the ceiling is what a balance may hold.
export const safeboxTransactionSchema = z
  .object({
    safebox: z.enum(["public", "boss"]),
    action: z.enum(["deposit", "withdraw", "adjustment"]),
    idempotency_key: z.string().uuid(),
    reason: z.string().trim().min(1).max(500),
    items: z
      .array(z.object({ item_key: z.string().trim().min(1), quantity: z.number().int() }))
      .min(1)
      .max(100),
  })
  .superRefine((value, context) => {
    const [minimum, maximum] = value.action === "adjustment" ? [0, maxItemQuantity] : [1, maxLineQuantity];
    const keys = new Set<string>();
    value.items.forEach((item, index) => {
      if (item.quantity < minimum || item.quantity > maximum)
        context.addIssue({ code: "custom", message: "Quantity is out of range", path: ["items", index, "quantity"] });
      if (keys.has(item.item_key))
        context.addIssue({ code: "custom", message: "Item must be unique", path: ["items", index, "item_key"] });
      keys.add(item.item_key);
    });
  });
export type SafeboxStockItem = z.infer<typeof stockItemSchema>;

/**
 * Display order and headings for the stock groups, keyed by the value the Go
 * API sends. Shared so the read-only board and the settings editor group and
 * name items identically.
 */
export const stockGroups = [
  { key: "crafting", label: "Crafting Stock" },
  { key: "ammo", label: "Ammo Stock" },
  { key: "body_drugs", label: "Body & Drugs Stock" },
  { key: "weapon", label: "Weapon Stock" },
  { key: "blueprint", label: "Blueprint Stock" },
  { key: "thief_tools", label: "Thief Tools Stock" },
  { key: "weapon_accessories", label: "Weapon Accessories Stock" },
] as const satisfies readonly { key: z.infer<typeof stockGroupSchema>; label: string }[];

export type SafeboxStock = z.infer<typeof safeboxStockSchema>;
export type SafeboxTransaction = z.infer<typeof safeboxTransactionSchema>;
export type SafeboxTransactions = z.infer<typeof safeboxTransactionsSchema>;
export const fetchSafeboxStockRoute = createRouteFetcher("/api/safebox-stock", safeboxStockSchema);
export const fetchSafeboxTransactionsRoute = createRouteFetcher(
  "/api/safebox-stock/transactions?safebox=public",
  safeboxTransactionsSchema,
);

export async function fetchSafeboxTransactions(
  baseURL: string,
  accessToken: string,
  safebox: "public" | "boss",
  fetcher: typeof fetch = fetch,
) {
  const url = new URL("/api/v1/safebox-stock/transactions", baseURL);
  url.searchParams.set("safebox", safebox);
  const response = await fetcher(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Safebox transactions API returned ${response.status}`);
  const parsed = safeboxTransactionsSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Safebox transactions API returned invalid data");
  return parsed.data;
}

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
